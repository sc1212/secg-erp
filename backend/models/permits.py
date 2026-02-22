"""Permits & Inspections models."""

from datetime import date
from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship
from backend.core.database import Base


class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class Permit(TimestampMixin, Base):
    __tablename__ = "permits"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    permit_number = Column(String(100))
    permit_type = Column(String(100), nullable=False)  # building, electrical, plumbing, mechanical, grading, demo, other
    description = Column(Text)
    issued_by = Column(String(200))  # jurisdiction / authority
    status = Column(String(20), default="pending")  # pending, applied, issued, active, expired, closed
    applied_date = Column(Date)
    issued_date = Column(Date)
    expiry_date = Column(Date)
    fee = Column(Numeric(10, 2))
    notes = Column(Text)

    project = relationship("Project")
    inspections = relationship("Inspection", back_populates="permit")


class Inspection(TimestampMixin, Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True)
    permit_id = Column(Integer, ForeignKey("permits.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    inspection_type = Column(String(100), nullable=False)  # framing, rough_electric, rough_plumbing, insulation, drywall, final
    scheduled_date = Column(Date)
    completed_date = Column(Date)
    result = Column(String(20))  # pass, fail, conditional, pending
    inspector_name = Column(String(200))
    notes = Column(Text)

    permit = relationship("Permit", back_populates="inspections")
    project = relationship("Project")
