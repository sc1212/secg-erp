"""CRM & Pipeline API — leads, proposals, bid pipeline.

GET  /api/crm/leads           → leads list
GET  /api/crm/proposals       → proposals list
GET  /api/crm/pipeline        → bid pipeline
GET  /api/crm/pipeline/summary → pipeline funnel summary
"""

from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.extended import BidPipeline, BidStatus, Lead, LeadProposal
from backend.schemas import (
    BidPipelineOut, LeadOut, LeadProposalOut, PaginatedResponse,
)

router = APIRouter(prefix="/crm", tags=["CRM & Pipeline"])


@router.get("/leads", response_model=PaginatedResponse)
def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    salesperson: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """CRM leads from BuilderTrend."""
    q = db.query(Lead)
    if status:
        q = q.filter(Lead.lead_status == status)
    if salesperson:
        q = q.filter(Lead.salesperson.ilike(f"%{salesperson}%"))
    if search:
        q = q.filter(Lead.opportunity_title.ilike(f"%{search}%"))

    total = q.count()
    items = q.order_by(Lead.id.desc()).offset(
        (page - 1) * per_page).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[LeadOut.model_validate(l) for l in items],
    )


@router.get("/proposals", response_model=List[LeadProposalOut])
def list_proposals(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Lead proposals with amounts and status."""
    q = db.query(LeadProposal)
    if status:
        q = q.filter(LeadProposal.status == status)
    proposals = q.order_by(LeadProposal.proposal_amount.desc().nullslast()).all()
    return [LeadProposalOut.model_validate(p) for p in proposals]


@router.get("/pipeline", response_model=PaginatedResponse)
def list_pipeline(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    salesperson: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Bid pipeline — future revenue opportunities."""
    q = db.query(BidPipeline)
    if status:
        try:
            q = q.filter(BidPipeline.status == BidStatus(status))
        except ValueError:
            pass
    if salesperson:
        q = q.filter(BidPipeline.salesperson.ilike(f"%{salesperson}%"))

    total = q.count()
    items = q.order_by(BidPipeline.estimated_value.desc()).offset(
        (page - 1) * per_page).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[BidPipelineOut.model_validate(b) for b in items],
    )


@router.get("/pipeline/summary")
def pipeline_summary(db: Session = Depends(get_db)):
    """Pipeline funnel summary by status — for charts."""
    rows = db.query(
        BidPipeline.status,
        func.count(BidPipeline.id),
        func.coalesce(func.sum(BidPipeline.estimated_value), 0),
    ).group_by(BidPipeline.status).all()

    total_val = Decimal("0")
    weighted = Decimal("0")
    stages = []
    for status, count, value in rows:
        prob_map = {
            BidStatus.identified: 10, BidStatus.pursuing: 25,
            BidStatus.bid_submitted: 50, BidStatus.won: 100,
            BidStatus.lost: 0,
        }
        prob = prob_map.get(status, 20)
        w = value * Decimal(str(prob)) / 100
        total_val += value
        weighted += w
        stages.append({
            "status": status.value if status else "unknown",
            "count": count,
            "value": float(value),
            "weighted": float(w),
        })

    return {
        "total_opportunities": sum(s["count"] for s in stages),
        "total_value": float(total_val),
        "weighted_value": float(weighted),
        "stages": sorted(stages, key=lambda x: x["value"], reverse=True),
    }


@router.get("/leads/by-salesperson")
def leads_by_salesperson(db: Session = Depends(get_db)):
    """Lead count and value grouped by salesperson — for performance tracking."""
    rows = db.query(
        Lead.salesperson,
        func.count(Lead.id),
        func.coalesce(func.sum(Lead.estimated_value), 0),
    ).group_by(Lead.salesperson).all()

    return [
        {"salesperson": sp or "Unassigned", "count": c, "value": float(v)}
        for sp, c, v in sorted(rows, key=lambda x: x[1], reverse=True)
    ]
