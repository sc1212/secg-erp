"""Pydantic schemas for Warranty & Callback Tracker."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class WarrantyItemOut(OrmBase):
    id: int
    project_id: int
    reported_by: Optional[str] = None
    reported_date: date
    category: Optional[str] = None
    description: str
    severity: str = "normal"
    responsible_vendor_id: Optional[int] = None
    assigned_to: Optional[int] = None
    status: str = "reported"
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    resolution_notes: Optional[str] = None
    cost_to_resolve: Optional[Decimal] = None
    charged_to: Optional[str] = None
    warranty_expiry: Optional[date] = None
    created_at: Optional[datetime] = None


class WarrantyItemCreate(BaseModel):
    project_id: int
    reported_by: Optional[str] = None
    reported_date: date
    category: Optional[str] = None
    description: str
    severity: str = "normal"
    responsible_vendor_id: Optional[int] = None
    assigned_to: Optional[int] = None
    warranty_expiry: Optional[date] = None


class WarrantyItemUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    resolution_notes: Optional[str] = None
    cost_to_resolve: Optional[Decimal] = None
    charged_to: Optional[str] = None
    assigned_to: Optional[int] = None
    responsible_vendor_id: Optional[int] = None
