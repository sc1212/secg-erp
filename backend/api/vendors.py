"""Vendors API — vendor listing, detail, scorecard.

GET  /api/vendors             → paginated vendor list
GET  /api/vendors/{id}        → vendor detail
GET  /api/vendors/scorecard   → ranked vendor scorecard
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Vendor
from backend.schemas import PaginatedResponse, VendorDetailOut, VendorListOut

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("/scorecard", response_model=List[VendorListOut])
def vendor_scorecard(
    trade: Optional[str] = None,
    min_score: int = Query(0, ge=0, le=5),
    db: Session = Depends(get_db),
):
    """Vendor scorecard — ranked by composite score, optionally filtered by trade."""
    q = db.query(Vendor).filter(Vendor.score_quality.isnot(None))
    if trade:
        q = q.filter(Vendor.trade.ilike(f"%{trade}%"))

    vendors = q.all()
    scored = []
    for v in vendors:
        scores = [s for s in [v.score_quality, v.score_timeliness,
                              v.score_communication, v.score_price] if s is not None]
        composite = sum(scores) / len(scores) if scores else 0
        if composite >= min_score:
            scored.append((composite, v))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [VendorListOut.model_validate(v) for _, v in scored]


@router.get("", response_model=PaginatedResponse)
def list_vendors(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    trade: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Paginated vendor listing."""
    q = db.query(Vendor)
    if search:
        q = q.filter(Vendor.name.ilike(f"%{search}%"))
    if trade:
        q = q.filter(Vendor.trade.ilike(f"%{trade}%"))

    total = q.count()
    items = q.order_by(Vendor.name).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[VendorListOut.model_validate(v) for v in items],
    )


@router.get("/{vendor_id}", response_model=VendorDetailOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """Vendor detail with all scorecard data."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorDetailOut.model_validate(vendor)
