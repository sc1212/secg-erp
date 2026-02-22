"""Phase 4 Intelligence models — Profit Fade, Cash Flow, Historical Costs."""

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


class ProfitFadeSnapshot(TimestampMixin, Base):
    """Weekly per-project margin/CPI health snapshot."""
    __tablename__ = "profit_fade_snapshots"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)

    # Contract
    original_contract = Column(Numeric(14, 2))
    approved_changes = Column(Numeric(14, 2), default=0)
    revised_contract = Column(Numeric(14, 2))

    # Costs
    costs_to_date = Column(Numeric(14, 2))
    estimated_cost_at_completion = Column(Numeric(14, 2))
    percent_complete = Column(Numeric(5, 2))

    # Earned Value
    earned_value = Column(Numeric(14, 2))
    cost_performance_index = Column(Numeric(6, 3))
    schedule_performance_index = Column(Numeric(6, 3))

    # Margin
    original_margin_pct = Column(Numeric(5, 2))
    current_margin_pct = Column(Numeric(5, 2))
    projected_margin_pct = Column(Numeric(5, 2))
    margin_fade_pct = Column(Numeric(5, 2))

    # Severity
    fade_severity = Column(String(20))  # none, watch, warning, critical

    # Financials
    unbilled_costs = Column(Numeric(14, 2), default=0)
    pending_change_orders = Column(Numeric(14, 2), default=0)
    unapproved_extras = Column(Numeric(14, 2), default=0)

    project = relationship("Project")


class CashFlowForecast(TimestampMixin, Base):
    """13-week rolling cash flow forecast."""
    __tablename__ = "cash_flow_forecasts"

    id = Column(Integer, primary_key=True)
    forecast_date = Column(Date, nullable=False)
    scenario = Column(String(30), default="expected")  # expected, best, worst

    # Inflows
    expected_draws = Column(Numeric(14, 2), default=0)
    expected_ar_collections = Column(Numeric(14, 2), default=0)
    other_inflows = Column(Numeric(14, 2), default=0)
    total_inflows = Column(Numeric(14, 2), default=0)

    # Outflows
    scheduled_payroll = Column(Numeric(14, 2), default=0)
    committed_vendor_payments = Column(Numeric(14, 2), default=0)
    debt_service = Column(Numeric(14, 2), default=0)
    expected_material_orders = Column(Numeric(14, 2), default=0)
    other_outflows = Column(Numeric(14, 2), default=0)
    total_outflows = Column(Numeric(14, 2), default=0)

    # Position
    starting_cash = Column(Numeric(14, 2), default=0)
    net_flow = Column(Numeric(14, 2), default=0)
    ending_cash = Column(Numeric(14, 2), default=0)


class HistoricalCostMetric(TimestampMixin, Base):
    """Per-completed-project cost benchmarks for estimating assistant."""
    __tablename__ = "historical_cost_metrics"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project_type = Column(String(100))
    total_sqft = Column(Integer)
    year_completed = Column(Integer)
    zip_code = Column(String(10))
    quality_tier = Column(String(50))  # standard, premium, luxury
    total_contract = Column(Numeric(14, 2))
    total_actual_cost = Column(Numeric(14, 2))
    gross_margin_pct = Column(Numeric(5, 2))
    cost_per_sqft = Column(Numeric(8, 2))
    trade_costs = Column(Text)  # JSON per-trade breakdown
    duration_days = Column(Integer)
    change_order_count = Column(Integer, default=0)
    change_order_total = Column(Numeric(14, 2), default=0)
    punch_items_count = Column(Integer, default=0)
    warranty_claims_count = Column(Integer, default=0)

    project = relationship("Project")
