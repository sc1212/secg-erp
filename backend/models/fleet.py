"""Fleet & Equipment SQLAlchemy ORM models.

Covers: vehicles, maintenance schedules, maintenance logs, and fuel logs
for tracking the company's fleet of trucks, trailers, and heavy equipment.
"""

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Column, Date, DateTime, Enum, ForeignKey,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


# ── Enums ────────────────────────────────────────────────────────────────

class VehicleType(str, enum.Enum):
    truck = "truck"
    trailer = "trailer"
    excavator = "excavator"
    skid_steer = "skid_steer"
    van = "van"
    car = "car"


class VehicleStatus(str, enum.Enum):
    active = "active"
    in_shop = "in_shop"
    out_of_service = "out_of_service"
    sold = "sold"


class FuelType(str, enum.Enum):
    gasoline = "gasoline"
    diesel = "diesel"
    electric = "electric"
    hybrid = "hybrid"


# ── Fleet Vehicles ───────────────────────────────────────────────────────

class FleetVehicle(TimestampMixin, Base):
    __tablename__ = "fleet_vehicles"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    vin = Column(String(17), unique=True)
    license_plate = Column(String(20))
    vehicle_type = Column(Enum(VehicleType))
    year = Column(Integer)
    make = Column(String(100))
    model = Column(String(100))
    color = Column(String(50))
    current_mileage = Column(Integer, default=0)
    fuel_type = Column(Enum(FuelType))
    assigned_to = Column(Integer, ForeignKey("employees.id"))
    assigned_project = Column(Integer, ForeignKey("projects.id"))
    status = Column(Enum(VehicleStatus), default=VehicleStatus.active)
    purchase_date = Column(Date)
    purchase_price = Column(Numeric(12, 2))
    insurance_policy = Column(String(100))
    insurance_expiry = Column(Date)
    registration_expiry = Column(Date)
    notes = Column(Text)
    photo_url = Column(Text)

    maintenance_schedules = relationship("MaintenanceSchedule", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")


# ── Maintenance Schedules ────────────────────────────────────────────────

class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("fleet_vehicles.id"), nullable=False)
    service_type = Column(String(200), nullable=False)
    interval_miles = Column(Integer)
    interval_months = Column(Integer)
    last_performed_date = Column(Date)
    last_performed_mileage = Column(Integer)
    next_due_date = Column(Date)
    next_due_mileage = Column(Integer)
    estimated_cost = Column(Numeric(10, 2))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))

    vehicle = relationship("FleetVehicle", back_populates="maintenance_schedules")


# ── Maintenance Logs ─────────────────────────────────────────────────────

class MaintenanceLog(TimestampMixin, Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("fleet_vehicles.id"), nullable=False)
    service_type = Column(String(200), nullable=False)
    performed_date = Column(Date, nullable=False)
    mileage_at_service = Column(Integer)
    cost = Column(Numeric(10, 2))
    vendor_name = Column(String(200))
    invoice_number = Column(String(100))
    notes = Column(Text)
    receipt_url = Column(Text)

    vehicle = relationship("FleetVehicle", back_populates="maintenance_logs")


# ── Fuel Logs ────────────────────────────────────────────────────────────

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("fleet_vehicles.id"), nullable=False)
    fill_date = Column(Date, nullable=False)
    gallons = Column(Numeric(6, 2))
    cost_per_gallon = Column(Numeric(5, 3))
    total_cost = Column(Numeric(8, 2))
    mileage_at_fill = Column(Integer)
    station = Column(String(200))
    project_id = Column(Integer, ForeignKey("projects.id"))
    receipt_url = Column(Text)

    vehicle = relationship("FleetVehicle", back_populates="fuel_logs")
