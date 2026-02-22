"""Phase 0 Foundation models — Approvals (thresholds/steps), VendorCompliance, Geofence, TimeClock.

Duplicate models (SystemEvent, Notification, NotificationRule, NotificationPreference,
ExceptionItem, ApprovalRequest, PeriodSnapshot) have been removed — canonical versions
live in backend.models.extended.
"""

from datetime import date, datetime
from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func, JSON,
)
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.core import TimestampMixin


class ApprovalThreshold(TimestampMixin, Base):
    __tablename__ = "approval_thresholds"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    workflow_type = Column(String(100), nullable=False)  # purchase_order, change_order, draw_request
    max_amount = Column(Numeric(14, 2), nullable=False)
    approver_role = Column(String(100), nullable=False)
    escalation_role = Column(String(100))
    notes = Column(Text)


class ApprovalStep(TimestampMixin, Base):
    __tablename__ = "approval_steps"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    approval_request_id = Column(Integer, ForeignKey("approval_requests.id"), nullable=False)
    step_order = Column(Integer, nullable=False, default=1)
    required_role = Column(String(100))
    assigned_to = Column(String(100))
    status = Column(String(20), default="pending")  # pending, approved, rejected, skipped
    action_at = Column(DateTime)
    notes = Column(Text)

    approval_request = relationship("ApprovalRequest", back_populates="steps")


class VendorCompliance(TimestampMixin, Base):
    __tablename__ = "vendor_compliance"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    doc_type = Column(String(100), nullable=False)  # coi, w9, license, bond
    expiry_date = Column(Date)
    file_path = Column(Text)
    verified_by = Column(String(100))
    verified_at = Column(DateTime)
    is_current = Column(Boolean, default=True)
    notes = Column(Text)

    vendor = relationship("Vendor")


class Geofence(TimestampMixin, Base):
    __tablename__ = "geofences"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    label = Column(String(200))
    lat = Column(Numeric(10, 7), nullable=False)
    lon = Column(Numeric(10, 7), nullable=False)
    radius_meters = Column(Integer, default=200)
    is_active = Column(Boolean, default=True)

    project = relationship("Project")


class TimeEntry(TimestampMixin, Base):
    __tablename__ = "time_entries"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    punch_in = Column(DateTime, nullable=False)
    punch_out = Column(DateTime)
    hours_worked = Column(Numeric(6, 2))
    lat_in = Column(Numeric(10, 7))
    lon_in = Column(Numeric(10, 7))
    lat_out = Column(Numeric(10, 7))
    lon_out = Column(Numeric(10, 7))
    is_approved = Column(Boolean, default=False)
    approved_by = Column(String(100))
    notes = Column(Text)

    employee = relationship("Employee")
    project = relationship("Project")
