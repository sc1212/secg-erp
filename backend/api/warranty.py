"""Warranty & Callback Tracker API."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.warranty import WarrantyItem
from backend.schemas.warranty import WarrantyItemOut, WarrantyItemCreate, WarrantyItemUpdate

router = APIRouter(prefix="/warranties", tags=["Warranties"])


@router.get("", response_model=list[WarrantyItemOut])
def list_warranty_items(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(WarrantyItem)
    if project_id:
        q = q.filter(WarrantyItem.project_id == project_id)
    if status:
        q = q.filter(WarrantyItem.status == status)
    if severity:
        q = q.filter(WarrantyItem.severity == severity)
    return [WarrantyItemOut.model_validate(w) for w in q.order_by(WarrantyItem.reported_date.desc()).limit(100).all()]


@router.get("/summary")
def warranty_summary(db: Session = Depends(get_db)):
    """KPI summary for dashboard."""
    open_count = db.query(func.count(WarrantyItem.id)).filter(
        WarrantyItem.status.in_(["reported", "assessed", "scheduled", "in_progress"])
    ).scalar() or 0
    urgent_count = db.query(func.count(WarrantyItem.id)).filter(
        WarrantyItem.severity == "urgent",
        WarrantyItem.status.in_(["reported", "assessed", "scheduled", "in_progress"]),
    ).scalar() or 0
    total_cost = db.query(func.sum(WarrantyItem.cost_to_resolve)).filter(
        WarrantyItem.status == "completed"
    ).scalar() or 0
    return {
        "open_items": open_count,
        "urgent_items": urgent_count,
        "total_resolution_cost": float(total_cost),
    }


@router.get("/{item_id}", response_model=WarrantyItemOut)
def get_warranty_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WarrantyItem).filter(WarrantyItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Warranty item not found")
    return WarrantyItemOut.model_validate(item)


@router.post("", response_model=WarrantyItemOut, status_code=201)
def create_warranty_item(payload: WarrantyItemCreate, db: Session = Depends(get_db)):
    item = WarrantyItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WarrantyItemOut.model_validate(item)


@router.patch("/{item_id}", response_model=WarrantyItemOut)
def update_warranty_item(item_id: int, payload: WarrantyItemUpdate, db: Session = Depends(get_db)):
    item = db.query(WarrantyItem).filter(WarrantyItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Warranty item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return WarrantyItemOut.model_validate(item)
