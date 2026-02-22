"""Daily Field Log models — daily site reports with crew, weather, photos."""

from sqlalchemy import (
    Column, Date, DateTime, ForeignKey,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


# ── Daily Logs ──────────────────────────────────────────────────────────

class DailyLog(TimestampMixin, Base):
    __tablename__ = "daily_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    # Auto-populated from weather_forecasts
    weather_summary = Column(Text)
    temp_high = Column(Integer)
    temp_low = Column(Integer)
    conditions = Column(String(100))

    # Manual entry
    work_performed = Column(Text)
    delays_issues = Column(Text)
    delay_severity = Column(String(20))  # none, minor, major
    visitors = Column(Text)
    safety_notes = Column(Text)
    material_deliveries = Column(Text)
    equipment_on_site = Column(Text)

    status = Column(String(20), default="draft")  # draft, submitted, reviewed
    submitted_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("employees.id"))
    reviewed_at = Column(DateTime)

    crew_entries = relationship("DailyLogCrewEntry", back_populates="daily_log", cascade="all, delete-orphan")
    photos = relationship("DailyLogPhoto", back_populates="daily_log", cascade="all, delete-orphan")


# ── Crew Entries ────────────────────────────────────────────────────────

class DailyLogCrewEntry(Base):
    __tablename__ = "daily_log_crew"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id"), nullable=False)
    entity_type = Column(String(20), nullable=False)  # employee, subcontractor
    entity_id = Column(Integer)  # employee_id or vendor_id
    entity_name = Column(String(200))
    headcount = Column(Integer, default=1)
    hours = Column(Numeric(4, 1))
    trade = Column(String(100))

    daily_log = relationship("DailyLog", back_populates="crew_entries")


# ── Photos ──────────────────────────────────────────────────────────────

class DailyLogPhoto(Base):
    __tablename__ = "daily_log_photos"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id"), nullable=False)
    file_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text)
    caption = Column(Text)
    taken_at = Column(DateTime)
    sort_order = Column(Integer, default=0)
    is_client_visible = Column(Integer, default=0)  # 1 = show in client portal

    daily_log = relationship("DailyLog", back_populates="photos")
