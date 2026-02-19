"""Projects API — project listing, detail, cost codes, SOV, draws, milestones.

GET  /api/projects              → paginated project list
GET  /api/projects/{id}         → full project detail with sub-resources
GET  /api/projects/{id}/costs   → cost code breakdown
GET  /api/projects/{id}/sov     → schedule of values
GET  /api/projects/{id}/draws   → draw/pay app history
GET  /api/projects/{id}/cos     → change orders
GET  /api/projects/{id}/milestones → project schedule
GET  /api/projects/{id}/transactions → cost events for project
"""

from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.core import (
    ChangeOrder, CostCode, CostEvent, PayApp, Project,
    ProjectStatus, SOVLine,
)
from backend.models.extended import ProjectMilestone
from backend.schemas import (
    ChangeOrderOut, CostCodeOut, CostEventOut, MilestoneOut,
    PaginatedResponse, PayAppOut, ProjectDetailOut, ProjectListOut,
    SOVLineOut,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=PaginatedResponse)
def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Paginated project listing with optional status filter and search."""
    q = db.query(Project)
    if status:
        try:
            q = q.filter(Project.status == ProjectStatus(status))
        except ValueError:
            pass
    if search:
        q = q.filter(
            Project.name.ilike(f"%{search}%") | Project.code.ilike(f"%{search}%")
        )

    total = q.count()
    items = q.order_by(Project.code).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[ProjectListOut.model_validate(p) for p in items],
    )


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Full project detail with cost codes, SOV, draws, COs, and milestones."""
    project = db.query(Project).options(
        joinedload(Project.cost_codes),
        joinedload(Project.sov_lines),
        joinedload(Project.pay_apps),
        joinedload(Project.change_orders),
        joinedload(Project.milestones),
    ).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectDetailOut(
        **{k: getattr(project, k) for k in ProjectListOut.model_fields if hasattr(project, k)},
        estimated_cost=project.estimated_cost or Decimal("0"),
        actual_completion=project.actual_completion,
        superintendent=project.superintendent,
        notes=project.notes,
        cost_codes=sorted(
            [CostCodeOut.model_validate(c) for c in project.cost_codes],
            key=lambda x: x.code,
        ),
        sov_lines=sorted(
            [SOVLineOut.model_validate(s) for s in project.sov_lines],
            key=lambda x: x.line_number,
        ),
        pay_apps=sorted(
            [PayAppOut.model_validate(p) for p in project.pay_apps],
            key=lambda x: x.pay_app_number,
        ),
        change_orders=[ChangeOrderOut.model_validate(co) for co in project.change_orders],
        milestones=sorted(
            [MilestoneOut.model_validate(m) for m in project.milestones],
            key=lambda x: x.sort_order,
        ),
    )


@router.get("/{project_id}/costs", response_model=List[CostCodeOut])
def get_cost_codes(project_id: int, db: Session = Depends(get_db)):
    """Cost code breakdown for a project."""
    _ensure_project(project_id, db)
    codes = db.query(CostCode).filter(
        CostCode.project_id == project_id
    ).order_by(CostCode.code).all()
    return [CostCodeOut.model_validate(c) for c in codes]


@router.get("/{project_id}/sov", response_model=List[SOVLineOut])
def get_sov(project_id: int, db: Session = Depends(get_db)):
    """Schedule of values for a project."""
    _ensure_project(project_id, db)
    lines = db.query(SOVLine).filter(
        SOVLine.project_id == project_id
    ).order_by(SOVLine.line_number).all()
    return [SOVLineOut.model_validate(s) for s in lines]


@router.get("/{project_id}/draws", response_model=List[PayAppOut])
def get_draws(project_id: int, db: Session = Depends(get_db)):
    """Draw / pay app history for a project."""
    _ensure_project(project_id, db)
    apps = db.query(PayApp).filter(
        PayApp.project_id == project_id
    ).order_by(PayApp.pay_app_number).all()
    return [PayAppOut.model_validate(p) for p in apps]


@router.get("/{project_id}/cos", response_model=List[ChangeOrderOut])
def get_change_orders(project_id: int, db: Session = Depends(get_db)):
    """Change orders for a project."""
    _ensure_project(project_id, db)
    cos = db.query(ChangeOrder).filter(
        ChangeOrder.project_id == project_id
    ).order_by(ChangeOrder.date_submitted.desc().nullslast()).all()
    return [ChangeOrderOut.model_validate(co) for co in cos]


@router.get("/{project_id}/milestones", response_model=List[MilestoneOut])
def get_milestones(project_id: int, db: Session = Depends(get_db)):
    """Project schedule milestones."""
    _ensure_project(project_id, db)
    ms = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project_id
    ).order_by(ProjectMilestone.sort_order).all()
    return [MilestoneOut.model_validate(m) for m in ms]


@router.get("/{project_id}/transactions", response_model=PaginatedResponse)
def get_project_transactions(
    project_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Paginated cost events (transactions) for a project."""
    _ensure_project(project_id, db)
    q = db.query(CostEvent).filter(CostEvent.project_id == project_id)
    total = q.count()
    items = q.order_by(CostEvent.date.desc().nullslast()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[CostEventOut.model_validate(e) for e in items],
    )


def _ensure_project(project_id: int, db: Session):
    if not db.query(Project.id).filter(Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
