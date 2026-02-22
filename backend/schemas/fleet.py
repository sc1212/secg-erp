"""Pydantic schemas for Fleet & Equipment endpoints."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Maintenance Schedule ─────────────────────────────────────────────────

class MaintenanceScheduleOut(OrmBase):
    id: int
    vehicle_id: int
    service_type: str
    interval_miles: Optional[int] = None
    interval_months: Optional[int] = None
    last_performed_date: Optional[date] = None
    last_performed_mileage: Optional[int] = None
    next_due_date: Optional[date] = None
    next_due_mileage: Optional[int] = None
    estimated_cost: Optional[Decimal] = None
    vendor_id: Optional[int] = None


# ── Maintenance Log ──────────────────────────────────────────────────────

class MaintenanceLogCreate(BaseModel):
    service_type: str
    performed_date: date
    mileage_at_service: Optional[int] = None
    cost: Optional[Decimal] = None
    vendor_name: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None


class MaintenanceLogOut(OrmBase):
    id: int
    vehicle_id: int
    service_type: str
    performed_date: date
    mileage_at_service: Optional[int] = None
    cost: Optional[Decimal] = None
    vendor_name: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: Optional[datetime] = None


# ── Fuel Log ─────────────────────────────────────────────────────────────

class FuelLogCreate(BaseModel):
    fill_date: date
    gallons: Optional[Decimal] = None
    cost_per_gallon: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    mileage_at_fill: Optional[int] = None
    station: Optional[str] = None
    project_id: Optional[int] = None
    receipt_url: Optional[str] = None


class FuelLogOut(OrmBase):
    id: int
    vehicle_id: int
    fill_date: date
    gallons: Optional[Decimal] = None
    cost_per_gallon: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    mileage_at_fill: Optional[int] = None
    station: Optional[str] = None
    project_id: Optional[int] = None
    receipt_url: Optional[str] = None


# ── Fleet Vehicle ────────────────────────────────────────────────────────

class FleetVehicleCreate(BaseModel):
    name: str
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    current_mileage: int = 0
    fuel_type: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_project: Optional[int] = None
    status: str = "active"
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    insurance_policy: Optional[str] = None
    insurance_expiry: Optional[date] = None
    registration_expiry: Optional[date] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None


class FleetVehicleUpdate(BaseModel):
    name: Optional[str] = None
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    current_mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_project: Optional[int] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    insurance_policy: Optional[str] = None
    insurance_expiry: Optional[date] = None
    registration_expiry: Optional[date] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None


class FleetVehicleOut(OrmBase):
    id: int
    name: str
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    vehicle_type: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    current_mileage: int = 0
    fuel_type: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_project: Optional[int] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    insurance_policy: Optional[str] = None
    insurance_expiry: Optional[date] = None
    registration_expiry: Optional[date] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FleetVehicleDetailOut(FleetVehicleOut):
    """Vehicle detail with nested maintenance and fuel history."""
    maintenance_schedules: List[MaintenanceScheduleOut] = []
    maintenance_logs: List[MaintenanceLogOut] = []
    fuel_logs: List[FuelLogOut] = []


# ── Maintenance Alert ────────────────────────────────────────────────────

class MaintenanceAlertOut(BaseModel):
    vehicle_id: int
    vehicle_name: str
    service_type: str
    next_due_date: Optional[date] = None
    next_due_mileage: Optional[int] = None
    current_mileage: int = 0
    miles_until_due: Optional[int] = None
    days_until_due: Optional[int] = None
    urgency: str = "upcoming"  # upcoming, due_soon, overdue
