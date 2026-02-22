"""Safety & Compliance models — incidents, toolbox talks, certifications."""

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey,
    Integer, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


class SafetyIncident(TimestampMixin, Base):
    __tablename__ = "safety_incidents"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    incident_date = Column(Date, nullable=False)
    incident_type = Column(String(50), nullable=False)  # near_miss, first_aid, recordable, lost_time, property_damage
    description = Column(Text, nullable=False)
    reported_by = Column(Integer, ForeignKey("employees.id"))
    involved_parties = Column(Text)
    root_cause = Column(Text)
    corrective_action = Column(Text)
    severity = Column(String(20))
    osha_recordable = Column(Boolean, default=False)
    days_lost = Column(Integer, default=0)
    photos = Column(Text)  # JSON array of photo URLs
    status = Column(String(20), default="open")  # open, investigating, resolved, closed


class ToolboxTalk(TimestampMixin, Base):
    __tablename__ = "toolbox_talks"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    topic = Column(String(300), nullable=False)
    conducted_by = Column(Integer, ForeignKey("employees.id"))
    conducted_date = Column(Date, nullable=False)
    attendees = Column(Text)  # JSON array of names/employee IDs
    notes = Column(Text)
    duration_minutes = Column(Integer)


class Certification(TimestampMixin, Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    cert_type = Column(String(200), nullable=False)  # OSHA 10, OSHA 30, CPR, CDL, etc.
    cert_number = Column(String(100))
    issued_date = Column(Date)
    expiry_date = Column(Date)
    document_id = Column(Integer, ForeignKey("documents.id"))
    status = Column(String(20), default="active")  # active, expired, pending_renewal
