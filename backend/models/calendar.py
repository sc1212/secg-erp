"""Calendar & Scheduling models — shared team calendar, events, and attendees."""

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey,
    Integer, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


# ── Calendar Events ─────────────────────────────────────────────────────

class CalendarEvent(TimestampMixin, Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    event_type = Column(String(50), nullable=False)  # inspection, meeting, deadline, delivery, milestone, pto, training, walkthrough, closing, draw_due, permit, personal
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime)
    all_day = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    location = Column(Text)
    created_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    color = Column(String(20))
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String(200))
    reminder_minutes = Column(Integer)
    visibility = Column(String(20), default="team")  # team, private, project
    source = Column(String(50))  # manual, milestone, draw, insurance, payroll
    source_entity_id = Column(Integer)  # ID of source record for auto-generated events

    attendees = relationship("CalendarAttendee", back_populates="event", cascade="all, delete-orphan")


# ── Calendar Attendees ──────────────────────────────────────────────────

class CalendarAttendee(Base):
    __tablename__ = "calendar_attendees"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("calendar_events.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    response = Column(String(20), default="pending")  # accepted, declined, pending

    event = relationship("CalendarEvent", back_populates="attendees")
