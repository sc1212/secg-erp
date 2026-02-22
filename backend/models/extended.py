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
    Integer, Numeric, String, Text,
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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    is_baseline = Column(Boolean, default=False)

    assumptions = relationship("ScenarioAssumption", back_populates="scenario")


class ScenarioAssumption(TimestampMixin, Base):
    __tablename__ = "scenario_assumptions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    variable_name = Column(String(200), nullable=False)
    variable_value = Column(String(200))
    notes = Column(Text)

    scenario = relationship("Scenario", back_populates="assumptions")


# ── Data Sources ─────────────────────────────────────────────────────────

class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    proposal_title = Column(String(300))
    opportunity_title = Column(String(300))
    client_contact = Column(String(200))
    salesperson = Column(String(100))
    client_price = Column(Numeric(14, 2), default=0)
    status = Column(String(50))
    notes = Column(Text)


# ── Billing (Stripe) ─────────────────────────────────────────────────────

class BillingCustomer(TimestampMixin, Base):
    __tablename__ = "billing_customers"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    org_id = Column(String(64), unique=True, nullable=False, index=True)
    org_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    stripe_customer_id = Column(String(100), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)


class BillingSubscription(TimestampMixin, Base):
    __tablename__ = "billing_subscriptions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    org_id = Column(String(64), nullable=False, index=True)
    stripe_customer_id = Column(String(100), nullable=False, index=True)
    stripe_subscription_id = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(50), default="incomplete")
    price_id = Column(String(100))
    current_period_end = Column(DateTime)


class BillingEvent(TimestampMixin, Base):
    __tablename__ = "billing_events"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    org_id = Column(String(64), index=True)
    event_type = Column(String(120), nullable=False)
    stripe_event_id = Column(String(100), index=True)
    status = Column(String(50), default="received")
    payload_json = Column(Text)


# ── Auth users (baseline) ────────────────────────────────────────────────

class UserAccount(TimestampMixin, Base):
    __tablename__ = "user_accounts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime)


# ── Calendar & Daily Logs (Phase 1) ─────────────────────────────────────

class CalendarEvent(TimestampMixin, Base):
    __tablename__ = "calendar_events"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, nullable=False, index=True, default=1)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    event_type = Column(String(50), nullable=False)
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
    visibility = Column(String(20), default="team")

    attendees = relationship("CalendarAttendee", back_populates="event", cascade="all, delete-orphan")


class CalendarAttendee(Base):
    __tablename__ = "calendar_attendees"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("calendar_events.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    response = Column(String(20), default="pending")

    event = relationship("CalendarEvent", back_populates="attendees")


class DailyLog(TimestampMixin, Base):
    __tablename__ = "daily_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, nullable=False, index=True, default=1)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    author_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    weather_summary = Column(Text)
    temp_high = Column(Integer)
    temp_low = Column(Integer)
    conditions = Column(String(100))
    work_performed = Column(Text)
    delays_issues = Column(Text)
    visitors = Column(Text)
    safety_notes = Column(Text)
    material_deliveries = Column(Text)
    equipment_on_site = Column(Text)
    status = Column(String(20), default="draft")
    submitted_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("employees.id"))
    reviewed_at = Column(DateTime)

    crew_entries = relationship("DailyLogCrewEntry", back_populates="daily_log", cascade="all, delete-orphan")
    photos = relationship("DailyLogPhoto", back_populates="daily_log", cascade="all, delete-orphan")


class DailyLogCrewEntry(Base):
    __tablename__ = "daily_log_crew"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id"), nullable=False)
    entity_type = Column(String(20), nullable=False)
    entity_id = Column(Integer)
    entity_name = Column(String(200))
    headcount = Column(Integer, default=1)
    hours = Column(Numeric(4, 1))
    trade = Column(String(100))

    daily_log = relationship("DailyLog", back_populates="crew_entries")


class DailyLogPhoto(Base):
    __tablename__ = "daily_log_photos"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"))
    prompt_template_id = Column(Integer, ForeignKey("photo_prompt_templates.id"))
    gps_latitude = Column(Numeric(10, 8))
    gps_longitude = Column(Numeric(11, 8))
    capture_timestamp = Column(DateTime)
    file_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text)
    caption = Column(Text)
    taken_at = Column(DateTime)
    sort_order = Column(Integer, default=0)

    daily_log = relationship("DailyLog", back_populates="photos")

# ── Foundation Engine Models (Phase 0) ──────────────────────────────────

class PhotoPromptTemplate(TimestampMixin, Base):
    __tablename__ = "photo_prompt_templates"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    construction_phase = Column(String(50), nullable=False)
    label = Column(String(100), nullable=False)
    description = Column(Text)
    is_required = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)


class Tenant(TimestampMixin, Base):
    __tablename__ = "tenants"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)


class Role(TimestampMixin, Base):
    __tablename__ = "roles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    permissions = Column(Text, nullable=False)


class Document(TimestampMixin, Base):
    __tablename__ = "documents"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    title = Column(String(300), nullable=False)
    doc_type = Column(String(50), nullable=False)
    file_url = Column(Text, nullable=False)
    file_size_bytes = Column(Integer)
    mime_type = Column(String(100))
    expiry_date = Column(Date)
    tags = Column(Text)
    version = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("documents.id"))
    status = Column(String(20), default="active")
    uploaded_by = Column(Integer, ForeignKey("employees.id"))
    notes = Column(Text)


class SystemEvent(TimestampMixin, Base):
    __tablename__ = "system_events"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)
    source_id = Column(Integer, nullable=False)
    payload = Column(Text)
    processed = Column(Boolean, default=False)


class NotificationRule(TimestampMixin, Base):
    __tablename__ = "notification_rules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    event_type = Column(String(100), nullable=False)
    condition = Column(Text)
    channels = Column(Text, nullable=False)
    recipient_roles = Column(Text)
    priority = Column(String(20), default="normal")
    message_template = Column(Text)
    is_active = Column(Boolean, default=True)


class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("system_events.id"))
    channel = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    title = Column(String(300), nullable=False)
    body = Column(Text)
    action_url = Column(Text)
    priority = Column(String(20), default="normal")
    source_type = Column(String(50))
    source_id = Column(Integer)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    sent_at = Column(DateTime)
    delivery_status = Column(String(20), default="pending")


class NotificationPreference(TimestampMixin, Base):
    __tablename__ = "notification_preferences"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    category = Column(String(50), nullable=False)
    channel_in_app = Column(Boolean, default=True)
    channel_email = Column(Boolean, default=True)
    channel_sms = Column(Boolean, default=False)
    channel_push = Column(Boolean, default=False)
    quiet_hours_start = Column(String(10))
    quiet_hours_end = Column(String(10))


class ApprovalRequest(TimestampMixin, Base):
    __tablename__ = "approval_requests"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    requested_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("employees.id"), nullable=False)
    approval_rule_id = Column(Integer, ForeignKey("approval_rules.id"))
    status = Column(String(30), default="pending")
    decision_at = Column(DateTime)
    decision_notes = Column(Text)
    due_date = Column(Date)
    escalated_to = Column(Integer, ForeignKey("employees.id"))
    escalated_at = Column(DateTime)

    steps = relationship("ApprovalStep", back_populates="approval_request")


class ApprovalRule(TimestampMixin, Base):
    __tablename__ = "approval_rules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    condition_field = Column(String(100))
    condition_operator = Column(String(10))
    condition_value = Column(Numeric(14, 2))
    approver_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    escalation_hours = Column(Integer, default=48)
    is_active = Column(Boolean, default=True)


class ExceptionItem(TimestampMixin, Base):
    __tablename__ = "exception_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    exception_type = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)
    source_id = Column(Integer)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="warning")
    assigned_to = Column(Integer, ForeignKey("employees.id"))
    status = Column(String(20), default="open")
    resolved_by = Column(Integer, ForeignKey("employees.id"))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)


class PeriodSnapshot(TimestampMixin, Base):
    __tablename__ = "period_snapshots"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    snapshot_type = Column(String(20), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    cash_position = Column(Numeric(14, 2), default=0)
    total_ar = Column(Numeric(14, 2), default=0)
    total_ap = Column(Numeric(14, 2), default=0)
    total_backlog = Column(Numeric(14, 2), default=0)
    total_committed = Column(Numeric(14, 2), default=0)
    project_snapshots = Column(Text)
    is_closed = Column(Boolean, default=False)
    closed_by = Column(Integer, ForeignKey("employees.id"))
    closed_at = Column(DateTime)
    notes = Column(Text)


class CostEvent(TimestampMixin, Base):
    __tablename__ = "cost_events"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    description = Column(String(500))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    source_type = Column(String(50), nullable=False)
    source_id = Column(Integer)
    division = Column(String(50))
    status = Column(String(20), default="pending")
    approved_by = Column(Integer, ForeignKey("employees.id"))
    approved_at = Column(DateTime)
    posted_at = Column(DateTime)
    qb_synced = Column(Boolean, default=False)
    qb_sync_id = Column(String(100))

    project = relationship("Project", back_populates="cost_events")
    cost_code = relationship("CostCode", back_populates="cost_events")
    vendor = relationship("Vendor", back_populates="cost_events")


class Integration(TimestampMixin, Base):
    __tablename__ = "integrations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)
    status = Column(String(20), default="disconnected")
    access_token_encrypted = Column(Text)
    refresh_token_encrypted = Column(Text)
    token_expires_at = Column(DateTime)
    last_sync_at = Column(DateTime)
    last_sync_status = Column(String(20))
    config = Column(Text)
    error_message = Column(Text)


class SyncLog(TimestampMixin, Base):
    __tablename__ = "sync_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False, index=True)
    direction = Column(String(10))
    entity_type = Column(String(50))
    records_processed = Column(Integer)
    records_failed = Column(Integer)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    status = Column(String(20))
    error_details = Column(Text)
