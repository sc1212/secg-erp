"""Pydantic schemas for SECG ERP API responses.

All schemas use orm_mode (from_attributes) so they can be built directly
from SQLAlchemy model instances.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ── Base Config ──────────────────────────────────────────────────────────

class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Dashboard / KPI ──────────────────────────────────────────────────────

class CashPositionOut(BaseModel):
    cash_on_hand: Decimal = Decimal("0")
    ar_outstanding: Decimal = Decimal("0")
    ap_outstanding: Decimal = Decimal("0")
    remaining_draws: Decimal = Decimal("0")
    retainage_receivable: Decimal = Decimal("0")
    retainage_payable: Decimal = Decimal("0")

class DebtSummaryOut(BaseModel):
    total_debt: Decimal = Decimal("0")
    construction_loans: Decimal = Decimal("0")
    credit_cards: Decimal = Decimal("0")
    mca_debt: Decimal = Decimal("0")
    other_debt: Decimal = Decimal("0")
    active_count: int = 0

class ProjectSummaryOut(BaseModel):
    active_projects: int = 0
    total_budget: Decimal = Decimal("0")
    total_spent: Decimal = Decimal("0")
    total_remaining: Decimal = Decimal("0")
    avg_percent_complete: Decimal = Decimal("0")

class PipelineSummaryOut(BaseModel):
    total_opportunities: int = 0
    total_value: Decimal = Decimal("0")
    weighted_value: Decimal = Decimal("0")
    won_count: int = 0
    won_value: Decimal = Decimal("0")

class PayrollSummaryOut(BaseModel):
    employee_count: int = 0
    biweekly_cost: Decimal = Decimal("0")
    annual_cost: Decimal = Decimal("0")
    next_pay_date: Optional[date] = None

class DashboardOut(BaseModel):
    cash: CashPositionOut
    debt: DebtSummaryOut
    projects: ProjectSummaryOut
    pipeline: PipelineSummaryOut
    payroll: PayrollSummaryOut
    alerts: List["AlertOut"] = []

class AlertOut(BaseModel):
    level: str  # critical, warning, info
    category: str
    message: str
    link: Optional[str] = None


# ── Projects ─────────────────────────────────────────────────────────────

class ProjectListOut(OrmBase):
    id: int
    code: str
    name: str
    status: Optional[str] = None
    project_type: Optional[str] = None
    budget_total: Decimal = Decimal("0")
    contract_amount: Decimal = Decimal("0")
    project_manager: Optional[str] = None
    start_date: Optional[date] = None
    target_completion: Optional[date] = None
    phase: Optional[str] = None

class CostCodeOut(OrmBase):
    id: int
    code: str
    description: str
    budget_amount: Decimal = Decimal("0")
    committed_amount: Decimal = Decimal("0")
    actual_amount: Decimal = Decimal("0")
    variance: Decimal = Decimal("0")
    category: Optional[str] = None

class SOVLineOut(OrmBase):
    id: int
    line_number: int
    description: Optional[str] = None
    scheduled_value: Decimal = Decimal("0")
    previous_billed: Decimal = Decimal("0")
    current_billed: Decimal = Decimal("0")
    stored_materials: Decimal = Decimal("0")
    percent_complete: Decimal = Decimal("0")
    balance_to_finish: Decimal = Decimal("0")

class PayAppOut(OrmBase):
    id: int
    pay_app_number: int
    amount_requested: Decimal = Decimal("0")
    amount_approved: Decimal = Decimal("0")
    retainage_held: Decimal = Decimal("0")
    net_payment: Decimal = Decimal("0")
    status: Optional[str] = None
    submitted_date: Optional[date] = None
    approved_date: Optional[date] = None
    paid_date: Optional[date] = None
    notes: Optional[str] = None

class ChangeOrderOut(OrmBase):
    id: int
    co_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Decimal = Decimal("0")
    status: Optional[str] = None
    requested_by: Optional[str] = None
    date_submitted: Optional[date] = None
    date_approved: Optional[date] = None
    notes: Optional[str] = None

class MilestoneOut(OrmBase):
    id: int
    task_name: str
    status: Optional[str] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    assigned_to: Optional[str] = None
    sort_order: int = 0
    notes: Optional[str] = None

class ProjectDetailOut(ProjectListOut):
    estimated_cost: Decimal = Decimal("0")
    actual_completion: Optional[date] = None
    superintendent: Optional[str] = None
    notes: Optional[str] = None
    cost_codes: List[CostCodeOut] = []
    sov_lines: List[SOVLineOut] = []
    pay_apps: List[PayAppOut] = []
    change_orders: List[ChangeOrderOut] = []
    milestones: List[MilestoneOut] = []


# ── Vendors ──────────────────────────────────────────────────────────────

class VendorListOut(OrmBase):
    id: int
    name: str
    trade: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    score_quality: Optional[int] = None
    score_timeliness: Optional[int] = None
    score_communication: Optional[int] = None
    score_price: Optional[int] = None
    insurance_expiry: Optional[date] = None

class VendorDetailOut(VendorListOut):
    contact_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    w9_on_file: bool = False
    license_number: Optional[str] = None
    notes: Optional[str] = None


# ── Employees ────────────────────────────────────────────────────────────

class EmployeeOut(OrmBase):
    id: int
    first_name: str
    last_name: str
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    salary: Optional[Decimal] = None
    is_active: bool = True


# ── Financial ────────────────────────────────────────────────────────────

class DebtOut(OrmBase):
    id: int
    name: str
    lender: Optional[str] = None
    debt_type: Optional[str] = None
    current_balance: Decimal = Decimal("0")
    original_balance: Decimal = Decimal("0")
    interest_rate: Optional[Decimal] = None
    monthly_payment: Optional[Decimal] = None
    is_active: bool = True
    notes: Optional[str] = None

class RecurringExpenseOut(OrmBase):
    id: int
    description: Optional[str] = None
    amount: Decimal = Decimal("0")
    frequency: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class PLEntryOut(OrmBase):
    id: int
    period_year: int
    period_month: int
    division: Optional[str] = None
    account_name: str
    amount: Decimal = Decimal("0")
    is_budget: bool = False

class InvoiceOut(OrmBase):
    id: int
    invoice_number: Optional[str] = None
    date_issued: Optional[date] = None
    date_due: Optional[date] = None
    amount: Decimal = Decimal("0")
    balance: Decimal = Decimal("0")
    status: Optional[str] = None
    notes: Optional[str] = None

class CostEventOut(OrmBase):
    id: int
    date: Optional[date] = None
    amount: Decimal = Decimal("0")
    description: Optional[str] = None
    reference_number: Optional[str] = None
    source: Optional[str] = None
    vendor_id: Optional[int] = None
    project_id: Optional[int] = None
    notes: Optional[str] = None

class CashForecastOut(OrmBase):
    id: int
    week_starting: Optional[date] = None
    category: Optional[str] = None
    amount_in: Decimal = Decimal("0")
    amount_out: Decimal = Decimal("0")
    net: Decimal = Decimal("0")

class RetainageOut(OrmBase):
    id: int
    project_id: Optional[int] = None
    vendor_id: Optional[int] = None
    amount_held: Decimal = Decimal("0")
    amount_released: Decimal = Decimal("0")
    balance: Decimal = Decimal("0")
    notes: Optional[str] = None

class PropertyOut(OrmBase):
    id: int
    address: str
    purchase_price: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    arv: Optional[Decimal] = None
    equity: Optional[Decimal] = None
    ltv: Optional[Decimal] = None
    exit_strategy: Optional[str] = None
    notes: Optional[str] = None


# ── CRM / Pipeline ──────────────────────────────────────────────────────

class BidPipelineOut(OrmBase):
    id: int
    opportunity_name: str
    client_name: Optional[str] = None
    salesperson: Optional[str] = None
    estimated_value: Decimal = Decimal("0")
    status: Optional[str] = None
    probability: Optional[Decimal] = None
    project_type: Optional[str] = None
    notes: Optional[str] = None

class LeadOut(OrmBase):
    id: int
    opportunity_title: Optional[str] = None
    lead_status: Optional[str] = None
    project_type: Optional[str] = None
    salesperson: Optional[str] = None
    client_contact: Optional[str] = None
    estimated_value: Optional[Decimal] = None
    notes: Optional[str] = None

class LeadProposalOut(OrmBase):
    id: int
    proposal_title: Optional[str] = None
    proposal_amount: Optional[Decimal] = None
    status: Optional[str] = None
    salesperson: Optional[str] = None
    sent_date: Optional[date] = None
    approved_date: Optional[date] = None
    notes: Optional[str] = None


# ── Lien Waivers ─────────────────────────────────────────────────────────

class LienWaiverOut(OrmBase):
    id: int
    project_id: Optional[int] = None
    vendor_id: Optional[int] = None
    waiver_type: Optional[str] = None
    amount: Decimal = Decimal("0")
    through_date: Optional[date] = None
    received_date: Optional[date] = None
    notes: Optional[str] = None


# ── Schedule ─────────────────────────────────────────────────────────────

class CrewAllocationOut(OrmBase):
    id: int
    employee_id: Optional[int] = None
    project_id: Optional[int] = None
    week_starting: Optional[date] = None
    role_on_project: Optional[str] = None
    hours_allocated: Decimal = Decimal("0")
    notes: Optional[str] = None


# ── Generic Pagination ───────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    page: int
    per_page: int
    pages: int
    items: list


# Rebuild forward refs
DashboardOut.model_rebuild()
