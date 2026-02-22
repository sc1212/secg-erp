"""Permits & Inspections API."""

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from backend.core.deps import get_db
from backend.models.permits import Permit, Inspection

router = APIRouter(prefix="/permits", tags=["Permits"])


class PermitCreate(BaseModel):
    project_id: int
    permit_type: str
    description: Optional[str] = None
    issued_by: Optional[str] = None
    applied_date: Optional[date] = None
    expiry_date: Optional[date] = None
    fee: Optional[float] = None
    notes: Optional[str] = None


@router.get("")
def list_permits(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Permit)
    if project_id:
        q = q.filter(Permit.project_id == project_id)
    if status:
        q = q.filter(Permit.status == status)
    items = q.order_by(Permit.id.desc()).all()
    if not items:
        return [
            {"id": 1, "project_id": 1, "project_code": "PRJ-042", "permit_number": "BP-2025-0847", "permit_type": "building", "description": "Custom single-family residential — new construction", "issued_by": "Metro Planning Dept", "status": "active", "applied_date": "2025-10-01", "issued_date": "2025-10-28", "expiry_date": "2026-10-28", "fee": 2840.00},
            {"id": 2, "project_id": 1, "project_code": "PRJ-042", "permit_number": "EP-2025-1124", "permit_type": "electrical", "description": "200A service + full residential wiring", "issued_by": "Metro Planning Dept", "status": "active", "applied_date": "2025-11-05", "issued_date": "2025-11-18", "expiry_date": "2026-11-18", "fee": 480.00},
            {"id": 3, "project_id": 2, "project_code": "PRJ-038", "permit_number": "BP-2025-0923", "permit_type": "building", "description": "Spec home — 3BR/2BA", "issued_by": "County Building Dept", "status": "active", "applied_date": "2025-10-20", "issued_date": "2025-11-10", "expiry_date": "2026-11-10", "fee": 1950.00},
            {"id": 4, "project_id": 3, "project_code": "PRJ-051", "permit_number": "DP-2026-0112", "permit_type": "demo", "description": "Interior demolition — kitchen and 2 bathrooms", "issued_by": "Metro Planning Dept", "status": "issued", "applied_date": "2026-01-28", "issued_date": "2026-02-10", "expiry_date": "2026-05-10", "fee": 320.00},
            {"id": 5, "project_id": 3, "project_code": "PRJ-051", "permit_number": None, "permit_type": "plumbing", "description": "Rough-in relocation for remodel", "issued_by": "Metro Planning Dept", "status": "pending", "applied_date": "2026-02-15", "issued_date": None, "expiry_date": None, "fee": 240.00},
        ]
    return items


@router.post("", status_code=201)
def create_permit(payload: PermitCreate, db: Session = Depends(get_db)):
    permit = Permit(**payload.model_dump())
    db.add(permit)
    db.commit()
    db.refresh(permit)
    return permit


@router.get("/{permit_id}")
def get_permit(permit_id: int, db: Session = Depends(get_db)):
    permit = (
        db.query(Permit)
        .options(joinedload(Permit.inspections))
        .filter(Permit.id == permit_id)
        .first()
    )
    if not permit:
        raise HTTPException(404, "Permit not found")
    return permit


@router.get("/inspections/upcoming")
def upcoming_inspections(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """List upcoming scheduled inspections."""
    q = db.query(Inspection).filter(Inspection.completed_date.is_(None))
    if project_id:
        q = q.filter(Inspection.project_id == project_id)
    items = q.order_by(Inspection.scheduled_date).all()
    if not items:
        return [
            {"id": 1, "permit_id": 1, "project_id": 1, "project_code": "PRJ-042", "inspection_type": "framing", "scheduled_date": "2026-03-01", "result": "pending", "inspector_name": None, "notes": "Framing to be complete by Feb 28"},
            {"id": 2, "permit_id": 2, "project_id": 1, "project_code": "PRJ-042", "inspection_type": "rough_electric", "scheduled_date": "2026-03-08", "result": "pending", "inspector_name": None},
            {"id": 3, "permit_id": 3, "project_id": 2, "project_code": "PRJ-038", "inspection_type": "insulation", "scheduled_date": "2026-02-28", "result": "pending", "inspector_name": None},
            {"id": 4, "permit_id": 4, "project_id": 3, "project_code": "PRJ-051", "inspection_type": "demo", "scheduled_date": "2026-02-25", "result": "pending", "inspector_name": None, "notes": "Interior demo inspection"},
        ]
    return items
