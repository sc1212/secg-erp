"""Pydantic schemas for Materials & Inventory endpoints."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Material Items ──────────────────────────────────────────────────────

class MaterialItemOut(OrmBase):
    id: int
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    default_unit_cost: Optional[Decimal] = None
    min_stock_alert: Optional[int] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MaterialItemCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    default_unit_cost: Optional[Decimal] = None
    min_stock_alert: Optional[int] = None
    notes: Optional[str] = None


# ── Inventory Entries ───────────────────────────────────────────────────

class InventoryEntryOut(OrmBase):
    id: int
    material_id: int
    location_type: Optional[str] = None
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_cost: Optional[Decimal] = None
    last_counted_date: Optional[date] = None
    last_counted_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ── Material Detail (item + entries) ────────────────────────────────────

class MaterialItemDetailOut(MaterialItemOut):
    inventory_entries: List[InventoryEntryOut] = []


# ── Material Transactions ───────────────────────────────────────────────

class MaterialTransactionOut(OrmBase):
    id: int
    material_id: int
    transaction_type: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    project_id: Optional[int] = None
    cost_code_id: Optional[int] = None
    vendor_id: Optional[int] = None
    po_number: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    logged_by: Optional[int] = None
    transaction_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MaterialTransactionCreate(BaseModel):
    material_id: int
    transaction_type: str
    quantity: Decimal
    unit_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    project_id: Optional[int] = None
    cost_code_id: Optional[int] = None
    vendor_id: Optional[int] = None
    po_number: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    logged_by: Optional[int] = None
    transaction_date: Optional[date] = None
