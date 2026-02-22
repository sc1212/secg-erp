"""Approvals / Decision Queue API."""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from backend.core.deps import get_db
from backend.models.foundation import ApprovalRequest, ApprovalStep, ApprovalThreshold

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/queue")
def approval_queue(
    status: Optional[str] = Query(None),
    workflow_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List pending approval requests (Decision Queue)."""
    q = db.query(ApprovalRequest)
    if status:
        q = q.filter(ApprovalRequest.status == status)
    else:
        q = q.filter(ApprovalRequest.status == "pending")
    if workflow_type:
        q = q.filter(ApprovalRequest.workflow_type == workflow_type)
    items = q.order_by(ApprovalRequest.created_at.desc()).all()
    if not items:
        return [
            {"id": 1, "entity_type": "purchase_order", "entity_id": 47, "workflow_type": "purchase_order", "amount": 12500.00, "requested_by": "Jake R.", "status": "pending", "notes": "PO-0047 — ACE Plumbing rough-in materials for PRJ-042", "created_at": "2026-02-22T07:45:00"},
            {"id": 2, "entity_type": "change_order", "entity_id": 23, "workflow_type": "change_order", "amount": 8750.00, "requested_by": "Sarah M.", "status": "pending", "notes": "CO-023 — PRJ-038 additional blocking per structural revision", "created_at": "2026-02-22T06:30:00"},
            {"id": 3, "entity_type": "draw_request", "entity_id": 3, "workflow_type": "draw_request", "amount": 45200.00, "requested_by": "Mike S.", "status": "pending", "notes": "Draw #3 — PRJ-042 Brentwood, ready for lender submission", "created_at": "2026-02-21T16:00:00"},
            {"id": 4, "entity_type": "purchase_order", "entity_id": 46, "workflow_type": "purchase_order", "amount": 3200.00, "requested_by": "Zach P.", "status": "pending", "notes": "PO-0046 — electrical fixtures PRJ-051", "created_at": "2026-02-21T10:00:00"},
        ]
    return items


@router.post("/{approval_id}/approve")
def approve_request(
    approval_id: int,
    approved_by: str = Query("mike"),
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Approve a pending request."""
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not req:
        raise HTTPException(404, "Approval request not found")
    req.status = "approved"
    req.resolved_at = datetime.now()
    if notes:
        req.notes = (req.notes or "") + f"\nApproved by {approved_by}: {notes}"
    db.commit()
    return {"ok": True, "status": "approved"}


@router.post("/{approval_id}/reject")
def reject_request(
    approval_id: int,
    rejected_by: str = Query("mike"),
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Reject a pending request."""
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not req:
        raise HTTPException(404, "Approval request not found")
    req.status = "rejected"
    req.resolved_at = datetime.now()
    if notes:
        req.notes = (req.notes or "") + f"\nRejected by {rejected_by}: {notes}"
    db.commit()
    return {"ok": True, "status": "rejected"}


@router.get("/thresholds")
def list_thresholds(db: Session = Depends(get_db)):
    """List approval thresholds."""
    items = db.query(ApprovalThreshold).all()
    if not items:
        return [
            {"id": 1, "workflow_type": "purchase_order", "max_amount": 5000.00, "approver_role": "superintendent", "escalation_role": "owner"},
            {"id": 2, "workflow_type": "purchase_order", "max_amount": 25000.00, "approver_role": "owner", "escalation_role": None},
            {"id": 3, "workflow_type": "change_order", "max_amount": 10000.00, "approver_role": "project_manager", "escalation_role": "owner"},
            {"id": 4, "workflow_type": "draw_request", "max_amount": 999999999.00, "approver_role": "owner", "escalation_role": None},
        ]
    return items
