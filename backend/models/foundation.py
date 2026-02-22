"""Phase 0 Foundation models — SystemEvent bus, Notifications, Approvals, Exceptions, Snapshots, VendorCompliance, TimeClock."""

from datetime import date, datetime
from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func, JSON,
)
from sqlalchemy.orm import relationship
from backend.core.database import Base


class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class SystemEvent(TimestampMixin, Base):
    """Event bus — every module publishes events here; the rules engine routes them to notifications.

    event_type examples:
      "invoice.created", "invoice.approved", "coi.expiring", "daily_log.missed",
      "weather.stop_work", "selection.overdue", "inspection.failed",
      "profit_fade.warning", "cash_runway.low", "maintenance.due"
    """
    __tablename__ = "system_events"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    event_type = Column(String(100), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)   # invoice, vendor, project, cost_event, etc.
    source_id = Column(Integer, nullable=False)
    payload = Column(JSON)                              # event-specific data
    processed = Column(Boolean, default=False, index=True)
    processed_at = Column(DateTime)


class NotificationRule(TimestampMixin, Base):
    __tablename__ = "notification_rules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    event_type = Column(String(100), nullable=False)
    channel = Column(String(20), nullable=False, default="in_app")  # in_app, email, sms
    roles = Column(String(200))  # comma-separated roles
    is_active = Column(Boolean, default=True)
    notes = Column(Text)


class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(String(100))  # string user identifier
    event_type = Column(String(100), nullable=False)
    title = Column(String(300), nullable=False)
    body = Column(Text)
    link = Column(String(500))
    channel = Column(String(20), default="in_app")
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)


class NotificationPreference(TimestampMixin, Base):
    __tablename__ = "notification_preferences"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), nullable=False)
    event_type = Column(String(100), nullable=False)
    channel = Column(String(20), nullable=False)
    is_enabled = Column(Boolean, default=True)


class ExceptionItem(TimestampMixin, Base):
    __tablename__ = "exception_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    exception_type = Column(String(100), nullable=False)  # unmapped_cost_code, duplicate_invoice, expired_coi, low_confidence_ocr, other
    status = Column(String(20), default="open")  # open, assigned, resolved, dismissed
    entity_type = Column(String(50))  # cost_event, invoice, vendor, document
    entity_id = Column(Integer)
    description = Column(Text, nullable=False)
    assigned_to = Column(String(100))
    resolved_by = Column(String(100))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    priority = Column(String(20), default="normal")  # low, normal, high, critical


class ApprovalThreshold(TimestampMixin, Base):
    __tablename__ = "approval_thresholds"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    workflow_type = Column(String(100), nullable=False)  # purchase_order, change_order, draw_request
    max_amount = Column(Numeric(14, 2), nullable=False)
    approver_role = Column(String(100), nullable=False)
    escalation_role = Column(String(100))
    notes = Column(Text)


class ApprovalRequest(TimestampMixin, Base):
    __tablename__ = "approval_requests"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    workflow_type = Column(String(100), nullable=False)
    amount = Column(Numeric(14, 2))
    requested_by = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")  # pending, approved, rejected, escalated
    resolved_at = Column(DateTime)
    notes = Column(Text)

    steps = relationship("ApprovalStep", back_populates="approval_request")


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


class PeriodSnapshot(TimestampMixin, Base):
    __tablename__ = "period_snapshots"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    snapshot_data = Column(JSON)
    generated_by = Column(String(100), default="system")
    notes = Column(Text)


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
