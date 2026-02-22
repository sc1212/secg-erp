"""Weather Intelligence models — forecasts, impact rules, project locations."""

from sqlalchemy import (
    Column, Date, DateTime, ForeignKey, Index,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


class WeatherForecast(TimestampMixin, Base):
    __tablename__ = "weather_forecasts"

    id = Column(Integer, primary_key=True)
    location_lat = Column(Numeric(9, 6))
    location_lng = Column(Numeric(9, 6))
    forecast_date = Column(Date, nullable=False)
    temp_high_f = Column(Integer)
    temp_low_f = Column(Integer)
    precipitation_pct = Column(Integer)       # 0-100
    precipitation_inches = Column(Numeric(4, 2))
    wind_speed_mph = Column(Integer)
    humidity_pct = Column(Integer)
    conditions = Column(String(100))          # "Partly Cloudy", "Rain", "Snow"
    icon_code = Column(String(20))
    sunrise = Column(String(10))
    sunset = Column(String(10))
    fetched_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_weather_forecast_date_lat_lng", "forecast_date", "location_lat", "location_lng"),
    )


class WeatherImpactRule(TimestampMixin, Base):
    __tablename__ = "weather_impact_rules"

    id = Column(Integer, primary_key=True)
    trade_or_activity = Column(String(100), nullable=False)   # "Concrete Pour", "Roofing", etc.
    condition_field = Column(String(50), nullable=False)       # "temp_low_f", "wind_speed_mph", etc.
    operator = Column(String(10), nullable=False)              # "lt", "gt", "gte", "lte", "eq"
    threshold_value = Column(Numeric(8, 2), nullable=False)
    severity = Column(String(20), default="warning")           # "warning", "stop_work", "caution"
    message_template = Column(Text)


class ProjectLocation(TimestampMixin, Base):
    __tablename__ = "project_locations"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
