"""Pydantic schemas for Employee Scorecard & Incentive Tracker."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IncentiveMetricOut(OrmBase):
    id: int
    metric_name: str
    metric_key: str
    weight: Decimal
    target_value: Optional[Decimal] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None


class IncentiveProgramOut(OrmBase):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    total_pool: Optional[Decimal] = None
    status: str = "active"
    metrics: List[IncentiveMetricOut] = []


class IncentiveProgramCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    total_pool: Optional[Decimal] = None


class EmployeeScoreOut(OrmBase):
    id: int
    program_id: int
    employee_id: int
    metric_id: int
    current_value: Optional[Decimal] = None
    score: Optional[Decimal] = None
    calculated_at: Optional[datetime] = None


class LeaderboardEntry(BaseModel):
    employee_id: int
    employee_name: str
    role: Optional[str] = None
    total_score: Decimal = Decimal("0")
    estimated_bonus: Decimal = Decimal("0")
    metrics: dict = {}
