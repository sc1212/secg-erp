"""Materials & Inventory API — catalog, stock levels, transactions, alerts."""

from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.inventory import MaterialItem, InventoryEntry, MaterialTransaction
from backend.schemas.inventory import (
    MaterialItemOut, MaterialItemCreate, MaterialItemDetailOut,
    InventoryEntryOut,
    MaterialTransactionOut, MaterialTransactionCreate,
)

router = APIRouter(prefix="/inventory", tags=["Inventory"])


# ── Materials CRUD ──────────────────────────────────────────────────────

@router.get("/materials", response_model=list[MaterialItemOut])
def list_materials(
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    """List all materials with optional search and category filter."""
    q = db.query(MaterialItem)
    if search:
        pattern = f"%{search}%"
        q = q.filter(
            MaterialItem.name.ilike(pattern) | MaterialItem.sku.ilike(pattern)
        )
    if category:
        q = q.filter(MaterialItem.category == category)
    return q.order_by(MaterialItem.name).all()


@router.post("/materials", response_model=MaterialItemOut, status_code=201)
def create_material(payload: MaterialItemCreate, db: Session = Depends(get_db)):
    """Add a new material to the catalog."""
    item = MaterialItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/materials/{material_id}", response_model=MaterialItemDetailOut)
def get_material(material_id: int, db: Session = Depends(get_db)):
    """Get material detail with all inventory entries."""
    item = (
        db.query(MaterialItem)
        .options(joinedload(MaterialItem.inventory_entries))
        .filter(MaterialItem.id == material_id)
        .first()
    )
    if not item:
        raise HTTPException(404, "Material not found")
    return MaterialItemDetailOut.model_validate(item)


# ── Inventory Entries ───────────────────────────────────────────────────

@router.get("/entries", response_model=list[InventoryEntryOut])
def list_entries(
    location_type: Optional[str] = Query(None, description="Filter by location type"),
    location_name: Optional[str] = Query(None, description="Filter by location name"),
    material_id: Optional[int] = Query(None, description="Filter by material"),
    db: Session = Depends(get_db),
):
    """List inventory entries with optional location filter."""
    q = db.query(InventoryEntry)
    if location_type:
        q = q.filter(InventoryEntry.location_type == location_type)
    if location_name:
        q = q.filter(InventoryEntry.location_name.ilike(f"%{location_name}%"))
    if material_id:
        q = q.filter(InventoryEntry.material_id == material_id)
    return q.order_by(InventoryEntry.id).all()


# ── Transactions ────────────────────────────────────────────────────────

@router.get("/transactions", response_model=list[MaterialTransactionOut])
def list_transactions(
    material_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Transaction history with optional filters."""
    q = db.query(MaterialTransaction)
    if material_id:
        q = q.filter(MaterialTransaction.material_id == material_id)
    if transaction_type:
        q = q.filter(MaterialTransaction.transaction_type == transaction_type)
    if project_id:
        q = q.filter(MaterialTransaction.project_id == project_id)
    return q.order_by(MaterialTransaction.transaction_date.desc(), MaterialTransaction.id.desc()).limit(limit).all()


@router.post("/transactions", response_model=MaterialTransactionOut, status_code=201)
def create_transaction(payload: MaterialTransactionCreate, db: Session = Depends(get_db)):
    """Log a material transaction (received, used, transferred, etc.)."""
    # Verify material exists
    material = db.query(MaterialItem).filter(MaterialItem.id == payload.material_id).first()
    if not material:
        raise HTTPException(404, "Material not found")

    # Auto-calculate total_cost if not provided
    data = payload.model_dump()
    if data.get("total_cost") is None and data.get("unit_cost") is not None and data.get("quantity") is not None:
        data["total_cost"] = data["unit_cost"] * data["quantity"]

    txn = MaterialTransaction(**data)
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


# ── Alerts ──────────────────────────────────────────────────────────────

@router.get("/alerts")
def inventory_alerts(db: Session = Depends(get_db)):
    """Low stock alerts + idle materials (60+ days with no transaction)."""
    # Low stock: total quantity across all entries < min_stock_alert
    materials = (
        db.query(MaterialItem)
        .options(joinedload(MaterialItem.inventory_entries))
        .filter(MaterialItem.min_stock_alert.isnot(None))
        .all()
    )

    low_stock = []
    for mat in materials:
        total_qty = sum(float(e.quantity or 0) for e in mat.inventory_entries)
        if total_qty < mat.min_stock_alert:
            low_stock.append({
                "material_id": mat.id,
                "name": mat.name,
                "sku": mat.sku,
                "category": mat.category,
                "total_quantity": total_qty,
                "min_stock_alert": mat.min_stock_alert,
                "deficit": mat.min_stock_alert - total_qty,
                "alert_type": "critical" if total_qty <= mat.min_stock_alert * 0.25 else "low",
            })

    # Idle materials: no transaction in 60+ days
    cutoff = date.today() - timedelta(days=60)
    all_materials = db.query(MaterialItem).all()

    # Get latest transaction date per material
    latest_txns = (
        db.query(
            MaterialTransaction.material_id,
            func.max(MaterialTransaction.transaction_date).label("last_txn"),
        )
        .group_by(MaterialTransaction.material_id)
        .all()
    )
    last_txn_map = {row.material_id: row.last_txn for row in latest_txns}

    idle = []
    for mat in all_materials:
        last_txn = last_txn_map.get(mat.id)
        if last_txn is None or last_txn < cutoff:
            days_idle = (date.today() - last_txn).days if last_txn else None
            idle.append({
                "material_id": mat.id,
                "name": mat.name,
                "sku": mat.sku,
                "category": mat.category,
                "last_transaction_date": last_txn.isoformat() if last_txn else None,
                "days_idle": days_idle,
                "alert_type": "idle",
            })

    return {
        "low_stock": low_stock,
        "idle_materials": idle,
        "total_alerts": len(low_stock) + len(idle),
    }
