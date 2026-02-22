"""Pydantic schemas for Weather Intelligence endpoints."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class WeatherForecastOut(OrmBase):
    id: int
    forecast_date: date
    temp_high_f: Optional[int] = None
    temp_low_f: Optional[int] = None
    precipitation_pct: Optional[int] = None
    precipitation_inches: Optional[Decimal] = None
    wind_speed_mph: Optional[int] = None
    humidity_pct: Optional[int] = None
    conditions: Optional[str] = None
    icon_code: Optional[str] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None


class WeatherImpactRuleOut(OrmBase):
    id: int
    trade_or_activity: str
    condition_field: str
    operator: str
    threshold_value: Decimal
    severity: str = "warning"
    message_template: Optional[str] = None


class WeatherImpactRuleCreate(BaseModel):
    trade_or_activity: str
    condition_field: str
    operator: str
    threshold_value: Decimal
    severity: str = "warning"
    message_template: Optional[str] = None


class WeatherImpact(BaseModel):
    """A computed impact — rule matched against forecast."""
    project_id: int
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    forecast_date: date
    rule_id: int
    trade_or_activity: str
    severity: str
    message: str
    condition_field: str
    actual_value: Optional[Decimal] = None
    threshold_value: Decimal


class WeatherDayOut(BaseModel):
    """A day's weather with associated impacts."""
    forecast: WeatherForecastOut
    impacts: List[WeatherImpact] = []
    affected_projects: int = 0


class ProjectLocationOut(OrmBase):
    id: int
    project_id: int
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
