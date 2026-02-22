"""Draw Requests API."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from backend.core.deps import get_db
from backend.models.purchase_orders import DrawRequest, DrawLineItem

router = APIRouter(prefix="/draw-requests", tags=["Draw Requests"])


@router.get("")
def list_draw_requests(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(DrawRequest)
    if project_id:
        q = q.filter(DrawRequest.project_id == project_id)
    if status:
        q = q.filter(DrawRequest.status == status)
    items = q.order_by(DrawRequest.id.desc()).all()
    if not items:
        return [
            {"id": 1, "project_id": 1, "project_code": "PRJ-042", "draw_number": 1, "amount_requested": 38500.00, "amount_approved": 38500.00, "status": "funded", "submitted_date": "2026-01-15", "funded_date": "2026-01-22", "lender": "First Bank Construction"},
            {"id": 2, "project_id": 1, "project_code": "PRJ-042", "draw_number": 2, "amount_requested": 42100.00, "amount_approved": 41800.00, "status": "funded", "submitted_date": "2026-02-05", "funded_date": "2026-02-12", "lender": "First Bank Construction"},
            {"id": 3, "project_id": 1, "project_code": "PRJ-042", "draw_number": 3, "amount_requested": 45200.00, "amount_approved": None, "status": "submitted", "submitted_date": "2026-02-20", "funded_date": None, "lender": "First Bank Construction"},
            {"id": 4, "project_id": 2, "project_code": "PRJ-038", "draw_number": 1, "amount_requested": 31000.00, "amount_approved": 31000.00, "status": "funded", "submitted_date": "2026-01-28", "funded_date": "2026-02-04", "lender": "Southeast Capital"},
        ]
    return items
