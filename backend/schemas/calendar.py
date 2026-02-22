"""Pydantic schemas for Calendar endpoints."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Attendee ────────────────────────────────────────────────────────────

class AttendeeOut(OrmBase):
    id: int
    employee_id: int
    response: str = "pending"


class AttendeeCreate(BaseModel):
    employee_id: int
    response: str = "pending"


# ── Calendar Event ──────────────────────────────────────────────────────

class CalendarEventOut(OrmBase):
    id: int
    title: str
    description: Optional[str] = None
    event_type: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    all_day: bool = False
    project_id: Optional[int] = None
    location: Optional[str] = None
    created_by: int
    color: Optional[str] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    reminder_minutes: Optional[int] = None
    visibility: str = "team"
    source: Optional[str] = None
    source_entity_id: Optional[int] = None
    attendees: List[AttendeeOut] = []


class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    all_day: bool = False
    project_id: Optional[int] = None
    location: Optional[str] = None
    created_by: int
    color: Optional[str] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    reminder_minutes: Optional[int] = None
    visibility: str = "team"
    attendees: List[AttendeeCreate] = []


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    all_day: Optional[bool] = None
    project_id: Optional[int] = None
    location: Optional[str] = None
    color: Optional[str] = None
    reminder_minutes: Optional[int] = None
    visibility: Optional[str] = None
    attendees: Optional[List[AttendeeCreate]] = None
