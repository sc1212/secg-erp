"""Core SQLAlchemy ORM models — matches alembic/versions/0001_core_schema.py.

Every table uses snake_case, includes created_at/updated_at, and carries
qb_txn_id where applicable for QuickBooks deduplication.
"""

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, ForeignKey, Index,
    Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base


# ── Enums ────────────────────────────────────────────────────────────────

class ProjectStatus(str, enum.Enum):
    pre_construction = "pre_construction"
    active = "active"
    on_hold = "on_hold"
    completed = "completed"
    warranty = "warranty"
    closed = "closed"


class ProjectType(str, enum.Enum):
    custom_home = "custom_home"
    spec_home = "spec_home"
    remodel = "remodel"
    multifamily = "multifamily"
    commercial = "commercial"
    land_development = "land_development"
    insurance_claim = "insurance_claim"


class CostEventType(str, enum.Enum):
    vendor_bill = "vendor_bill"
    material_purchase = "material_purchase"
    labor = "labor"
    subcontractor = "subcontractor"
    equipment = "equipment"
    overhead = "overhead"
    permit_fee = "permit_fee"
    other = "other"


class CostEventSource(str, enum.Enum):
    manual = "manual"
    qbo_sync = "qbo_sync"
    masterfile_import = "masterfile_import"
    csv_import = "csv_import"
    ramp_import = "ramp_import"
    lowes_import = "lowes_import"
    homedepot_import = "homedepot_import"
    buildertrend_import = "buildertrend_import"


class CommitmentStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    executed = "executed"
    completed = "completed"
    cancelled = "cancelled"


class ChangeOrderStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    void = "void"


class PayAppStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    paid = "paid"
    rejected = "rejected"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    partial = "partial"
    paid = "paid"
    overdue = "overdue"
    void = "void"


class PaymentMethod(str, enum.Enum):
    check = "check"
    ach = "ach"
    wire = "wire"
    credit_card = "credit_card"
    cash = "cash"
    other = "other"


class LienWaiverStatus(str, enum.Enum):
    not_required = "not_required"
    pending = "pending"
    conditional = "conditional"
    unconditional = "unconditional"
    received = "received"


class WorkflowAction(str, enum.Enum):
    approve_co = "approve_co"
    approve_pay_app = "approve_pay_app"
    review_variance = "review_variance"
    lien_waiver_follow_up = "lien_waiver_follow_up"
    budget_override = "budget_override"


class WorkflowTaskStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    escalated = "escalated"


class QuoteStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"


class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    proposal_sent = "proposal_sent"
    sold = "sold"
    lost = "lost"
    no_opportunity = "no_opportunity"


class ProposalStatus(str, enum.Enum):
    not_sent = "not_sent"
    sent = "sent"
    viewed = "viewed"
    approved = "approved"
    rejected = "rejected"


# ── Mixin ────────────────────────────────────────────────────────────────

class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


# ── Clients ──────────────────────────────────────────────────────────────

class Client(TimestampMixin, Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    contact_name = Column(String(200))
    email = Column(String(200))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    qb_customer_id = Column(String(50), unique=True)
    notes = Column(Text)

    projects = relationship("Project", back_populates="client")


# ── Employees ────────────────────────────────────────────────────────────

class Employee(TimestampMixin, Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(String(100))
    email = Column(String(200))
    phone = Column(String(50))
    hire_date = Column(Date)
    hourly_rate = Column(Numeric(10, 2))
    salary = Column(Numeric(12, 2))
    is_active = Column(Boolean, default=True)
    qb_employee_id = Column(String(50), unique=True)
    notes = Column(Text)


# ── Vendors ──────────────────────────────────────────────────────────────

class Vendor(TimestampMixin, Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    contact_name = Column(String(200))
    email = Column(String(200))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    trade = Column(String(100))
    w9_on_file = Column(Boolean, default=False)
    insurance_expiry = Column(Date)
    license_number = Column(String(100))
    qb_vendor_id = Column(String(50), unique=True)
    score_quality = Column(Integer)
    score_timeliness = Column(Integer)
    score_communication = Column(Integer)
    score_price = Column(Integer)
    notes = Column(Text)

    commitments = relationship("Commitment", back_populates="vendor")
    cost_events = relationship("CostEvent", back_populates="vendor")
    quotes = relationship("Quote", back_populates="vendor")


# ── Projects ─────────────────────────────────────────────────────────────

class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(300), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.active)
    project_type = Column(Enum(ProjectType))
    client_id = Column(Integer, ForeignKey("clients.id"))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    contract_amount = Column(Numeric(14, 2), default=0)
    estimated_cost = Column(Numeric(14, 2), default=0)
    budget_total = Column(Numeric(14, 2), default=0)
    start_date = Column(Date)
    target_completion = Column(Date)
    actual_completion = Column(Date)
    project_manager = Column(String(100))
    superintendent = Column(String(100))
    phase = Column(String(100))
    qb_class_id = Column(String(50))
    notes = Column(Text)

    client = relationship("Client", back_populates="projects")
    cost_codes = relationship("CostCode", back_populates="project")
    cost_events = relationship("CostEvent", back_populates="project")
    commitments = relationship("Commitment", back_populates="project")
    change_orders = relationship("ChangeOrder", back_populates="project")
    sov_lines = relationship("SOVLine", back_populates="project")
    pay_apps = relationship("PayApp", back_populates="project")
    invoices = relationship("Invoice", back_populates="project")
    quotes_rel = relationship("Quote", back_populates="project")
    milestones = relationship("ProjectMilestone", back_populates="project")


# ── Cost Codes ───────────────────────────────────────────────────────────

class CostCode(TimestampMixin, Base):
    __tablename__ = "cost_codes"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    code = Column(String(20), nullable=False)
    description = Column(String(300), nullable=False)
    budget_amount = Column(Numeric(14, 2), default=0)
    committed_amount = Column(Numeric(14, 2), default=0)
    actual_amount = Column(Numeric(14, 2), default=0)
    estimated_at_completion = Column(Numeric(14, 2), default=0)
    variance = Column(Numeric(14, 2), default=0)
    category = Column(String(100))
    sort_order = Column(Integer, default=0)
    notes = Column(Text)

    project = relationship("Project", back_populates="cost_codes")
    cost_events = relationship("CostEvent", back_populates="cost_code")


# ── Contracts ────────────────────────────────────────────────────────────

class Contract(TimestampMixin, Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    title = Column(String(300), nullable=False)
    contract_number = Column(String(50))
    amount = Column(Numeric(14, 2), default=0)
    executed_date = Column(Date)
    notes = Column(Text)


# ── Commitments ──────────────────────────────────────────────────────────

class Commitment(TimestampMixin, Base):
    __tablename__ = "commitments"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    description = Column(String(300))
    original_amount = Column(Numeric(14, 2), default=0)
    approved_cos = Column(Numeric(14, 2), default=0)
    revised_amount = Column(Numeric(14, 2), default=0)
    billed_to_date = Column(Numeric(14, 2), default=0)
    remaining = Column(Numeric(14, 2), default=0)
    status = Column(Enum(CommitmentStatus), default=CommitmentStatus.draft)
    qb_txn_id = Column(String(50))
    notes = Column(Text)

    project = relationship("Project", back_populates="commitments")
    vendor = relationship("Vendor", back_populates="commitments")


# ── Change Orders ────────────────────────────────────────────────────────

class ChangeOrder(TimestampMixin, Base):
    __tablename__ = "change_orders"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    co_number = Column(String(20), nullable=False)
    title = Column(String(300))
    description = Column(Text)
    amount = Column(Numeric(14, 2), default=0)
    status = Column(Enum(ChangeOrderStatus), default=ChangeOrderStatus.draft)
    requested_by = Column(String(100))
    approved_by = Column(String(100))
    date_submitted = Column(Date)
    date_approved = Column(Date)
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    qb_txn_id = Column(String(50))
    notes = Column(Text)

    project = relationship("Project", back_populates="change_orders")


# ── Cost Events (canonical actuals ledger) ───────────────────────────────

class CostEvent(TimestampMixin, Base):
    __tablename__ = "cost_events"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    event_type = Column(Enum(CostEventType))
    date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    description = Column(String(500))
    reference_number = Column(String(100))
    po_number = Column(String(100))
    check_number = Column(String(50))
    source = Column(Enum(CostEventSource), default=CostEventSource.manual)
    source_ref = Column(String(200))
    import_batch = Column(String(100))
    qb_txn_id = Column(String(50))
    notes = Column(Text)

    project = relationship("Project", back_populates="cost_events")
    cost_code = relationship("CostCode", back_populates="cost_events")
    vendor = relationship("Vendor", back_populates="cost_events")


# ── Quotes ───────────────────────────────────────────────────────────────

class Quote(TimestampMixin, Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    quote_number = Column(String(50))
    scope_category = Column(String(200))
    scope_description = Column(Text)
    labor_material = Column(String(50))
    amount = Column(Numeric(14, 2), default=0)
    quote_date = Column(Date)
    is_approved = Column(Boolean, default=False)
    contract_issued = Column(Boolean, default=False)
    priority = Column(Integer)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.draft)
    notes = Column(Text)

    project = relationship("Project", back_populates="quotes_rel")
    vendor = relationship("Vendor", back_populates="quotes")


# ── SOV Lines ────────────────────────────────────────────────────────────

class SOVLine(TimestampMixin, Base):
    __tablename__ = "sov_lines"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    line_number = Column(Integer, nullable=False)
    description = Column(String(300))
    scheduled_value = Column(Numeric(14, 2), default=0)
    previous_billed = Column(Numeric(14, 2), default=0)
    current_billed = Column(Numeric(14, 2), default=0)
    stored_materials = Column(Numeric(14, 2), default=0)
    total_completed = Column(Numeric(14, 2), default=0)
    percent_complete = Column(Numeric(5, 2), default=0)
    balance_to_finish = Column(Numeric(14, 2), default=0)
    retainage = Column(Numeric(14, 2), default=0)
    notes = Column(Text)

    project = relationship("Project", back_populates="sov_lines")


# ── Pay Applications ─────────────────────────────────────────────────────

class PayApp(TimestampMixin, Base):
    __tablename__ = "pay_apps"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    pay_app_number = Column(Integer, nullable=False)
    period_from = Column(Date)
    period_to = Column(Date)
    amount_requested = Column(Numeric(14, 2), default=0)
    amount_approved = Column(Numeric(14, 2), default=0)
    retainage_held = Column(Numeric(14, 2), default=0)
    net_payment = Column(Numeric(14, 2), default=0)
    status = Column(Enum(PayAppStatus), default=PayAppStatus.draft)
    submitted_date = Column(Date)
    approved_date = Column(Date)
    paid_date = Column(Date)
    qb_txn_id = Column(String(50))
    notes = Column(Text)

    project = relationship("Project", back_populates="pay_apps")
    lines = relationship("PayAppLine", back_populates="pay_app")


class PayAppLine(TimestampMixin, Base):
    __tablename__ = "pay_app_lines"

    id = Column(Integer, primary_key=True)
    pay_app_id = Column(Integer, ForeignKey("pay_apps.id"), nullable=False)
    sov_line_id = Column(Integer, ForeignKey("sov_lines.id"))
    description = Column(String(300))
    scheduled_value = Column(Numeric(14, 2), default=0)
    previous_billed = Column(Numeric(14, 2), default=0)
    this_period = Column(Numeric(14, 2), default=0)
    stored_materials = Column(Numeric(14, 2), default=0)
    total_completed = Column(Numeric(14, 2), default=0)
    percent_complete = Column(Numeric(5, 2), default=0)
    balance_to_finish = Column(Numeric(14, 2), default=0)
    retainage = Column(Numeric(14, 2), default=0)

    pay_app = relationship("PayApp", back_populates="lines")


# ── Invoices (AR) ────────────────────────────────────────────────────────

class Invoice(TimestampMixin, Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"))
    invoice_number = Column(String(50), nullable=False)
    date_issued = Column(Date)
    date_due = Column(Date)
    amount = Column(Numeric(14, 2), default=0)
    amount_paid = Column(Numeric(14, 2), default=0)
    balance = Column(Numeric(14, 2), default=0)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.draft)
    qb_txn_id = Column(String(50))
    notes = Column(Text)

    project = relationship("Project", back_populates="invoices")


class InvoiceLine(TimestampMixin, Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    description = Column(String(300))
    quantity = Column(Numeric(10, 2), default=1)
    unit_price = Column(Numeric(14, 2), default=0)
    amount = Column(Numeric(14, 2), default=0)


# ── Payments ─────────────────────────────────────────────────────────────

class Payment(TimestampMixin, Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    method = Column(Enum(PaymentMethod))
    reference_number = Column(String(100))
    lien_waiver_status = Column(Enum(LienWaiverStatus), default=LienWaiverStatus.not_required)
    qb_txn_id = Column(String(50))
    notes = Column(Text)


# ── Documents ────────────────────────────────────────────────────────────

class Document(TimestampMixin, Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    file_path = Column(Text)
    file_type = Column(String(50))
    file_size_bytes = Column(Integer)
    uploaded_by = Column(String(100))
    notes = Column(Text)


class DocumentVersion(TimestampMixin, Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(Text)
    uploaded_by = Column(String(100))
    notes = Column(Text)


class DocumentLink(TimestampMixin, Base):
    __tablename__ = "document_links"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)


# ── Workflow Tasks ───────────────────────────────────────────────────────

class WorkflowTask(TimestampMixin, Base):
    __tablename__ = "workflow_tasks"

    id = Column(Integer, primary_key=True)
    action = Column(Enum(WorkflowAction), nullable=False)
    status = Column(Enum(WorkflowTaskStatus), default=WorkflowTaskStatus.pending)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    assigned_to = Column(String(100))
    requested_by = Column(String(100))
    due_date = Column(Date)
    completed_date = Column(Date)
    notes = Column(Text)


# ── Audit Log ────────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)  # INSERT, UPDATE, DELETE
    field_name = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String(100))
    changed_at = Column(DateTime, server_default=func.now(), nullable=False)
    notes = Column(Text)
