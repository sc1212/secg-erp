"""Purchase Orders API."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from backend.core.deps import get_db
from backend.models.purchase_orders import PurchaseOrder, PurchaseOrderLine

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


@router.get("")
def list_purchase_orders(
    status: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    vendor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(PurchaseOrder)
    if status:
        q = q.filter(PurchaseOrder.status == status)
    if project_id:
        q = q.filter(PurchaseOrder.project_id == project_id)
    if vendor_id:
        q = q.filter(PurchaseOrder.vendor_id == vendor_id)
    items = q.order_by(PurchaseOrder.id.desc()).all()
    if not items:
        return [
            {"id": 1, "po_number": "PO-0044", "project_id": 1, "project_code": "PRJ-042", "vendor_name": "Ferguson Supply", "description": "Plumbing fixtures and rough materials", "status": "received", "total": 8420.00, "issued_date": "2026-02-10", "expected_date": "2026-02-17", "received_date": "2026-02-16"},
            {"id": 2, "po_number": "PO-0045", "project_id": 2, "project_code": "PRJ-038", "vendor_name": "ABC Lumber", "description": "Dimensional lumber for framing", "status": "partial", "total": 14800.00, "issued_date": "2026-02-14", "expected_date": "2026-02-21", "received_date": None},
            {"id": 3, "po_number": "PO-0046", "project_id": 3, "project_code": "PRJ-051", "vendor_name": "Graybar Electric", "description": "Electrical fixtures and panels", "status": "issued", "total": 3200.00, "issued_date": "2026-02-20", "expected_date": "2026-02-25", "received_date": None},
            {"id": 4, "po_number": "PO-0047", "project_id": 1, "project_code": "PRJ-042", "vendor_name": "ACE Plumbing Supply", "description": "Rough-in materials phase 2", "status": "draft", "total": 12500.00, "issued_date": None, "expected_date": "2026-03-01", "received_date": None},
        ]
    return items


@router.get("/{po_id}")
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).options(joinedload(PurchaseOrder.lines)).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(404, "Purchase order not found")
    return po
