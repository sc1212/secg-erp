"""Warranty & Callback Tracker models."""

from sqlalchemy import (
    Column, Date, ForeignKey, Integer, Numeric, String, Text,
)

from backend.core.database import Base
from backend.models.core import TimestampMixin


class WarrantyItem(TimestampMixin, Base):
    __tablename__ = "warranty_items"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reported_by = Column(String(200))
    reported_date = Column(Date, nullable=False)
    category = Column(String(100))  # Plumbing, Electrical, Drywall, Foundation, HVAC, Roofing, Appliance
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="normal")  # urgent, normal, cosmetic
    responsible_vendor_id = Column(Integer, ForeignKey("vendors.id"))
    assigned_to = Column(Integer, ForeignKey("employees.id"))
    status = Column(String(30), default="reported")  # reported, assessed, scheduled, in_progress, completed, disputed, closed
    scheduled_date = Column(Date)
    completed_date = Column(Date)
    resolution_notes = Column(Text)
    cost_to_resolve = Column(Numeric(10, 2))
    charged_to = Column(String(50))  # vendor_warranty, company, homeowner, insurance
    warranty_expiry = Column(Date)
