"""Extended SQLAlchemy ORM models — matches alembic/versions/0002_remaining_masterfile_tabs.py.

Covers: debts, properties, recurring expenses, cash snapshots, forecasts,
payroll, P&L, scenarios, COA, lien waivers, milestones, retainage,
bid pipeline, crew allocations, phase sync, leads, and proposals.
"""

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, ForeignKey,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


# ── Additional Enums ─────────────────────────────────────────────────────

class DebtType(str, enum.Enum):
    construction_loan = "construction_loan"
    line_of_credit = "line_of_credit"
    equipment_loan = "equipment_loan"
    vehicle_loan = "vehicle_loan"
    credit_card = "credit_card"
    personal_loan = "personal_loan"
    sba_loan = "sba_loan"
    other = "other"


class PropertyExitStrategy(str, enum.Enum):
    sell = "sell"
    rent = "rent"
    hold = "hold"
    refinance = "refinance"
    owner_occupied = "owner_occupied"


class RecurringFrequency(str, enum.Enum):
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"


class BidStatus(str, enum.Enum):
    identified = "identified"
    pursuing = "pursuing"
    bid_submitted = "bid_submitted"
    shortlisted = "shortlisted"
    won = "won"
    lost = "lost"
    no_bid = "no_bid"


class MilestoneStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    delayed = "delayed"
    blocked = "blocked"


# ── Debts ────────────────────────────────────────────────────────────────

class Debt(TimestampMixin, Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String(300), nullable=False)
    lender = Column(String(200))
    debt_type = Column(Enum(DebtType))
    original_balance = Column(Numeric(14, 2), default=0)
    current_balance = Column(Numeric(14, 2), default=0)
    interest_rate = Column(Numeric(6, 4))
    monthly_payment = Column(Numeric(14, 2), default=0)
    maturity_date = Column(Date)
    loan_number = Column(String(100))
    collateral = Column(Text)
    is_active = Column(Boolean, default=True)
    notes = Column(Text)


# ── Properties (portfolio tracking) ──────────────────────────────────────

class Property(TimestampMixin, Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    address = Column(Text, nullable=False)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    purchase_price = Column(Numeric(14, 2))
    current_value = Column(Numeric(14, 2))
    arv = Column(Numeric(14, 2))  # after-repair value
    equity = Column(Numeric(14, 2))
    ltv = Column(Numeric(6, 4))
    exit_strategy = Column(Enum(PropertyExitStrategy))
    monthly_rent = Column(Numeric(14, 2))
    is_owned = Column(Boolean, default=True)
    notes = Column(Text)


# ── Chart of Accounts ────────────────────────────────────────────────────

class ChartOfAccounts(TimestampMixin, Base):
    __tablename__ = "chart_of_accounts"

    id = Column(Integer, primary_key=True)
    account_number = Column(String(20), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    account_type = Column(String(50))  # Asset, Liability, Equity, Revenue, Expense
    parent_account_number = Column(String(20))
    is_active = Column(Boolean, default=True)
    qb_account_id = Column(String(50))
    notes = Column(Text)


# ── Recurring Expenses ───────────────────────────────────────────────────

class RecurringExpense(TimestampMixin, Base):
    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    description = Column(String(300), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    frequency = Column(Enum(RecurringFrequency))
    next_due_date = Column(Date)
    account_number = Column(String(20))
    project_id = Column(Integer, ForeignKey("projects.id"))
    is_active = Column(Boolean, default=True)
    notes = Column(Text)


# ── Cash Snapshots ───────────────────────────────────────────────────────

class CashSnapshot(TimestampMixin, Base):
    __tablename__ = "cash_snapshots"

    id = Column(Integer, primary_key=True)
    snapshot_date = Column(Date, nullable=False)
    account_name = Column(String(200))
    balance = Column(Numeric(14, 2), default=0)
    available_credit = Column(Numeric(14, 2), default=0)
    total_position = Column(Numeric(14, 2), default=0)
    notes = Column(Text)


# ── Cash Forecast Lines ──────────────────────────────────────────────────

class CashForecastLine(TimestampMixin, Base):
    __tablename__ = "cash_forecast_lines"

    id = Column(Integer, primary_key=True)
    week_starting = Column(Date, nullable=False)
    category = Column(String(200))
    description = Column(String(300))
    amount_in = Column(Numeric(14, 2), default=0)
    amount_out = Column(Numeric(14, 2), default=0)
    net = Column(Numeric(14, 2), default=0)
    running_balance = Column(Numeric(14, 2), default=0)
    confidence = Column(String(20))  # high, medium, low
    notes = Column(Text)


# ── Phase Sync Entries ───────────────────────────────────────────────────

class PhaseSyncEntry(TimestampMixin, Base):
    __tablename__ = "phase_sync_entries"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    phase_name = Column(String(200), nullable=False)
    status = Column(String(50))
    planned_start = Column(Date)
    planned_end = Column(Date)
    actual_start = Column(Date)
    actual_end = Column(Date)
    percent_complete = Column(Numeric(5, 2), default=0)
    notes = Column(Text)


# ── Payroll Entries ──────────────────────────────────────────────────────

class PayrollEntry(TimestampMixin, Base):
    __tablename__ = "payroll_entries"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    gross_pay = Column(Numeric(12, 2), default=0)
    net_pay = Column(Numeric(12, 2), default=0)
    employer_taxes = Column(Numeric(12, 2), default=0)
    total_cost = Column(Numeric(12, 2), default=0)
    hours_regular = Column(Numeric(8, 2), default=0)
    hours_overtime = Column(Numeric(8, 2), default=0)
    notes = Column(Text)


# ── Payroll Calendar ─────────────────────────────────────────────────────

class PayrollCalendar(TimestampMixin, Base):
    __tablename__ = "payroll_calendar"

    id = Column(Integer, primary_key=True)
    pay_date = Column(Date, nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    total_gross = Column(Numeric(14, 2), default=0)
    total_employer_cost = Column(Numeric(14, 2), default=0)
    status = Column(String(50))  # scheduled, processed, paid
    notes = Column(Text)


# ── P&L Entries ──────────────────────────────────────────────────────────

class PLEntry(TimestampMixin, Base):
    __tablename__ = "pl_entries"

    id = Column(Integer, primary_key=True)
    period_year = Column(Integer, nullable=False)
    period_month = Column(Integer, nullable=False)
    division = Column(String(50))  # company_wide, multifamily, custom_homes
    account_number = Column(String(20))
    account_name = Column(String(200))
    amount = Column(Numeric(14, 2), default=0)
    is_budget = Column(Boolean, default=False)
    notes = Column(Text)


# ── Scenarios ────────────────────────────────────────────────────────────

class Scenario(TimestampMixin, Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    is_baseline = Column(Boolean, default=False)

    assumptions = relationship("ScenarioAssumption", back_populates="scenario")


class ScenarioAssumption(TimestampMixin, Base):
    __tablename__ = "scenario_assumptions"

    id = Column(Integer, primary_key=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    variable_name = Column(String(200), nullable=False)
    variable_value = Column(String(200))
    notes = Column(Text)

    scenario = relationship("Scenario", back_populates="assumptions")


# ── Data Sources ─────────────────────────────────────────────────────────

class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    source_type = Column(String(50))  # qbo, csv, masterfile, manual
    last_sync_at = Column(DateTime)
    record_count = Column(Integer, default=0)
    status = Column(String(50))
    notes = Column(Text)


# ── Lien Waivers ─────────────────────────────────────────────────────────

class LienWaiver(TimestampMixin, Base):
    __tablename__ = "lien_waivers"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    pay_app_id = Column(Integer, ForeignKey("pay_apps.id"))
    waiver_type = Column(String(50))  # conditional, unconditional
    amount = Column(Numeric(14, 2))
    through_date = Column(Date)
    received_date = Column(Date)
    document_path = Column(Text)
    notes = Column(Text)


# ── Project Milestones (schedule) ────────────────────────────────────────

class ProjectMilestone(TimestampMixin, Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_name = Column(String(300), nullable=False)
    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.not_started)
    planned_start = Column(Date)
    planned_end = Column(Date)
    actual_start = Column(Date)
    actual_end = Column(Date)
    assigned_to = Column(String(100))
    depends_on_id = Column(Integer, ForeignKey("project_milestones.id"))
    sort_order = Column(Integer, default=0)
    notes = Column(Text)

    project = relationship("Project", back_populates="milestones")


# ── Retainage Entries ────────────────────────────────────────────────────

class RetainageEntry(TimestampMixin, Base):
    __tablename__ = "retainage_entries"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    amount_held = Column(Numeric(14, 2), default=0)
    amount_released = Column(Numeric(14, 2), default=0)
    balance = Column(Numeric(14, 2), default=0)
    release_date = Column(Date)
    notes = Column(Text)


# ── Bid Pipeline ─────────────────────────────────────────────────────────

class BidPipeline(TimestampMixin, Base):
    __tablename__ = "bid_pipeline"

    id = Column(Integer, primary_key=True)
    opportunity_name = Column(String(300), nullable=False)
    client_name = Column(String(200))
    project_type = Column(String(100))
    estimated_value = Column(Numeric(14, 2), default=0)
    bid_due_date = Column(Date)
    status = Column(Enum(BidStatus), default=BidStatus.identified)
    probability = Column(Numeric(5, 2))
    salesperson = Column(String(100))
    notes = Column(Text)


# ── Crew Allocations ─────────────────────────────────────────────────────

class CrewAllocation(TimestampMixin, Base):
    __tablename__ = "crew_allocations"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    week_starting = Column(Date, nullable=False)
    hours_allocated = Column(Numeric(8, 2), default=0)
    role_on_project = Column(String(100))
    notes = Column(Text)


# ── Leads ────────────────────────────────────────────────────────────────

class Lead(TimestampMixin, Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)
    opportunity_title = Column(String(300))
    client_contact = Column(String(200))
    email = Column(String(200))
    phone = Column(String(50))
    cell_phone = Column(String(50))
    street_address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(10))
    opp_street_address = Column(Text)
    opp_city = Column(String(100))
    opp_state = Column(String(50))
    opp_zip = Column(String(10))
    lead_status = Column(String(50))
    confidence = Column(Integer, default=0)
    estimated_revenue_min = Column(Numeric(14, 2), default=0)
    estimated_revenue_max = Column(Numeric(14, 2), default=0)
    estimated_revenue = Column(Numeric(14, 2), default=0)
    salesperson = Column(String(100))
    source = Column(String(200))
    project_type = Column(String(100))
    proposal_status = Column(String(200))
    last_contacted = Column(String(200))
    has_been_contacted = Column(Boolean, default=False)
    created_date = Column(Date)
    sold_date = Column(Date)
    projected_sales_date = Column(Date)
    related_job = Column(String(200))
    tags = Column(Text)
    notes = Column(Text)


# ── Lead Proposals ───────────────────────────────────────────────────────

class LeadProposal(TimestampMixin, Base):
    __tablename__ = "lead_proposals"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    proposal_title = Column(String(300))
    opportunity_title = Column(String(300))
    client_contact = Column(String(200))
    salesperson = Column(String(100))
    client_price = Column(Numeric(14, 2), default=0)
    status = Column(String(50))
    notes = Column(Text)
