"""Employee Scorecard & Incentive Tracker models."""

from sqlalchemy import (
    Column, Date, DateTime, ForeignKey,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


class IncentiveProgram(TimestampMixin, Base):
    __tablename__ = "incentive_programs"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_pool = Column(Numeric(12, 2))
    status = Column(String(20), default="active")  # active, completed, cancelled

    metrics = relationship("IncentiveMetric", back_populates="program", cascade="all, delete-orphan")
    scores = relationship("EmployeeScore", back_populates="program")


class IncentiveMetric(TimestampMixin, Base):
    __tablename__ = "incentive_metrics"

    id = Column(Integer, primary_key=True)
    program_id = Column(Integer, ForeignKey("incentive_programs.id"), nullable=False)
    metric_name = Column(String(200), nullable=False)
    metric_key = Column(String(100), nullable=False)  # project_margin, daily_log_compliance, on_time_completion, safety_days, change_order_recovery
    weight = Column(Numeric(5, 2), nullable=False)  # 0.30 = 30%
    target_value = Column(Numeric(10, 2))
    min_value = Column(Numeric(10, 2))
    max_value = Column(Numeric(10, 2))

    program = relationship("IncentiveProgram", back_populates="metrics")


class EmployeeScore(TimestampMixin, Base):
    __tablename__ = "employee_scores"

    id = Column(Integer, primary_key=True)
    program_id = Column(Integer, ForeignKey("incentive_programs.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    metric_id = Column(Integer, ForeignKey("incentive_metrics.id"), nullable=False)
    current_value = Column(Numeric(10, 2))
    score = Column(Numeric(5, 2))  # 0-100 normalized
    calculated_at = Column(DateTime, server_default=func.now())

    program = relationship("IncentiveProgram", back_populates="scores")
