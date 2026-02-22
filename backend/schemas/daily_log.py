"""Pydantic schemas for Daily Field Log endpoints."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Crew Entry ──────────────────────────────────────────────────────────

class CrewEntryOut(OrmBase):
    id: int
    entity_type: str
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    headcount: int = 1
    hours: Optional[Decimal] = None
    trade: Optional[str] = None


class CrewEntryCreate(BaseModel):
    entity_type: str  # employee, subcontractor
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    headcount: int = 1
    hours: Optional[Decimal] = None
    trade: Optional[str] = None


# ── Photo ───────────────────────────────────────────────────────────────

class PhotoOut(OrmBase):
    id: int
    file_url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    taken_at: Optional[datetime] = None
    sort_order: int = 0
    is_client_visible: int = 0


# ── Daily Log ───────────────────────────────────────────────────────────

class DailyLogOut(OrmBase):
    id: int
    project_id: int
    log_date: date
    author_id: int

    weather_summary: Optional[str] = None
    temp_high: Optional[int] = None
    temp_low: Optional[int] = None
    conditions: Optional[str] = None

    work_performed: Optional[str] = None
    delays_issues: Optional[str] = None
    delay_severity: Optional[str] = None
    visitors: Optional[str] = None
    safety_notes: Optional[str] = None
    material_deliveries: Optional[str] = None
    equipment_on_site: Optional[str] = None

    status: str = "draft"
    submitted_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    crew_entries: List[CrewEntryOut] = []
    photos: List[PhotoOut] = []


class DailyLogListOut(OrmBase):
    """Lightweight version for list views."""
    id: int
    project_id: int
    log_date: date
    author_id: int
    work_performed: Optional[str] = None
    status: str = "draft"
    submitted_at: Optional[datetime] = None
    conditions: Optional[str] = None
    temp_high: Optional[int] = None
    temp_low: Optional[int] = None
    created_at: Optional[datetime] = None
    photo_count: int = 0
    crew_count: int = 0


class DailyLogCreate(BaseModel):
    project_id: int
    log_date: date
    author_id: int

    weather_summary: Optional[str] = None
    temp_high: Optional[int] = None
    temp_low: Optional[int] = None
    conditions: Optional[str] = None

    work_performed: Optional[str] = None
    delays_issues: Optional[str] = None
    delay_severity: Optional[str] = "none"
    visitors: Optional[str] = None
    safety_notes: Optional[str] = None
    material_deliveries: Optional[str] = None
    equipment_on_site: Optional[str] = None

    crew_entries: List[CrewEntryCreate] = []


class DailyLogUpdate(BaseModel):
    work_performed: Optional[str] = None
    delays_issues: Optional[str] = None
    delay_severity: Optional[str] = None
    visitors: Optional[str] = None
    safety_notes: Optional[str] = None
    material_deliveries: Optional[str] = None
    equipment_on_site: Optional[str] = None
    crew_entries: Optional[List[CrewEntryCreate]] = None


class DailyLogFeedItem(OrmBase):
    """For the dashboard 'Today's Logs' widget."""
    id: int
    project_id: int
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    log_date: date
    author_id: int
    author_name: Optional[str] = None
    work_performed: Optional[str] = None
    status: str = "draft"
    submitted_at: Optional[datetime] = None
    photo_count: int = 0
