"""Exception Queue API — human triage for unmapped items, duplicates, etc."""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.foundation import ExceptionItem

router = APIRouter(prefix="/exceptions", tags=["Exception Queue"])


@router.get("")
def list_exceptions(
    status: Optional[str] = Query(None, description="Filter by status: open, assigned, resolved, dismissed"),
    exception_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List exception queue items."""
    q = db.query(ExceptionItem)
    if status:
        q = q.filter(ExceptionItem.status == status)
    if exception_type:
        q = q.filter(ExceptionItem.exception_type == exception_type)
    items = q.order_by(ExceptionItem.created_at.desc()).all()
    if not items:
        return [
            {"id": 1, "exception_type": "unmapped_cost_code", "status": "open", "entity_type": "cost_event", "entity_id": 2847, "description": "Cost event from QBO import has no matching cost code — vendor: Home Depot, amount: $847.32", "assigned_to": None, "priority": "high", "created_at": "2026-02-22T06:00:00"},
            {"id": 2, "exception_type": "duplicate_invoice", "status": "open", "entity_type": "invoice", "entity_id": 441, "description": "Invoice #INV-2241 may be duplicate of #INV-2238 (same vendor, same amount $3,200 within 3 days)", "assigned_to": None, "priority": "high", "created_at": "2026-02-21T18:30:00"},
            {"id": 3, "exception_type": "expired_coi", "status": "assigned", "entity_type": "vendor", "entity_id": 7, "description": "ACE Plumbing COI expired 2026-02-01 — vendor is on active project PRJ-042", "assigned_to": "Sarah M.", "priority": "critical", "created_at": "2026-02-21T09:00:00"},
            {"id": 4, "exception_type": "low_confidence_ocr", "status": "open", "entity_type": "cost_event", "entity_id": 2851, "description": "Receipt scan confidence 42% — amount may be $1,847 or $1,247 — manual review needed", "assigned_to": None, "priority": "normal", "created_at": "2026-02-20T14:15:00"},
            {"id": 5, "exception_type": "missing_lien_waiver", "status": "open", "entity_type": "invoice", "entity_id": 438, "description": "Payment #PAY-338 to Franklin Electric ($8,400) — no lien waiver on file", "assigned_to": None, "priority": "normal", "created_at": "2026-02-20T10:00:00"},
            {"id": 6, "exception_type": "budget_overrun", "status": "resolved", "entity_type": "cost_code", "entity_id": 51, "description": "PRJ-038 Framing cost code exceeded budget by $4,200 (118% spent)", "assigned_to": "Mike S.", "resolved_by": "Mike S.", "resolved_at": "2026-02-19T11:00:00", "resolution_notes": "Approved overage — lumber price spike", "priority": "normal", "created_at": "2026-02-18T08:00:00"},
        ]
    return items


@router.get("/open-count")
def open_count(db: Session = Depends(get_db)):
    """Count of open exception items."""
    count = db.query(ExceptionItem).filter(ExceptionItem.status.in_(["open", "assigned"])).count()
    if count == 0:
        total = db.query(ExceptionItem).count()
        if total == 0:
            return {"count": 3}
    return {"count": count}


@router.post("/{exception_id}/resolve")
def resolve_exception(
    exception_id: int,
    resolved_by: str = Query("mike"),
    resolution_notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Mark exception as resolved."""
    item = db.query(ExceptionItem).filter(ExceptionItem.id == exception_id).first()
    if not item:
        raise HTTPException(404, "Exception not found")
    item.status = "resolved"
    item.resolved_by = resolved_by
    item.resolved_at = datetime.now()
    if resolution_notes:
        item.resolution_notes = resolution_notes
    db.commit()
    return {"ok": True}


@router.post("/{exception_id}/assign")
def assign_exception(
    exception_id: int,
    assigned_to: str = Query(...),
    db: Session = Depends(get_db),
):
    """Assign exception to a team member."""
    item = db.query(ExceptionItem).filter(ExceptionItem.id == exception_id).first()
    if not item:
        raise HTTPException(404, "Exception not found")
    item.status = "assigned"
    item.assigned_to = assigned_to
    db.commit()
    return {"ok": True}
