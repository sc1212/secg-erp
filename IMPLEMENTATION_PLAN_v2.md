# SECG ERP — Implementation Plan v2 (Architecture-First)

**Date**: 2026-02-21
**Supersedes**: REFACTOR_PLAN.md (v1 — UI-first approach)
**Reference**: DRILLDOWN_ARCHITECTURE.md, WORKFLOW_SPECS.md, DATA_RELATIONSHIPS.md, ROLE_FLOWS.md, INTERACTION_STANDARDS.md

---

## Philosophy Change

v1 was: fix bugs → wire frontend to existing APIs → add CRUD → add tests
v2 is: **build the system logic first, then build the interface around it**

The previous approach produced polished screens with no operational depth. This plan reverses the priority:

1. **Data model corrections** (make the relationships correct)
2. **Business logic layer** (calculations, cascades, validations)
3. **API layer with full drilldown support** (every KPI to source records)
4. **CRUD with workflow actions** (not just display — approve, flag, escalate)
5. **Auth and roles** (who sees what, who can do what)
6. **Frontend rebuilt against the architecture** (not before it)

No UI work happens until the system logic is proven correct.

---

## Phase 1: Data Model & Business Logic Foundation (Week 1)

### 1.1 Fix Data Model Issues

**Goal**: Every entity relationship defined in DATA_RELATIONSHIPS.md must be enforceable in the schema.

**Changes to `backend/models/core.py`:**

1. Add `phase` field to CostCode for phase-level grouping:
   ```
   CostCode.phase = Column(String(100))  # e.g., "Pre-Construction", "Foundation", "Framing"
   ```

2. Add variance root cause enum:
   ```python
   class VarianceCause(str, enum.Enum):
       scope_change = "scope_change"
       quantity_overrun = "quantity_overrun"
       price_increase = "price_increase"
       rework = "rework"
       estimate_error = "estimate_error"
       weather = "weather"
       code_change = "code_change"
       other = "other"
   ```

3. Add `variance_cause` to CostEvent:
   ```
   CostEvent.variance_cause = Column(Enum(VarianceCause))
   ```

4. Add `commitment_id` foreign key to CostEvent:
   ```
   CostEvent.commitment_id = Column(Integer, ForeignKey("commitments.id"))
   ```

5. Wire orphan models or remove them:
   - **Contract**: Merge functionality into Commitment (a contract IS a commitment)
   - **Payment**: Wire to Commitment and Invoice — this is critical for the AP → payment → cash chain
   - **Document/DocumentVersion/DocumentLink**: Wire to Document API or defer to Phase 5
   - **WorkflowTask**: Wire to approval workflows or defer to Phase 4
   - **InvoiceLine**: Wire to Invoice

6. Add `project_id` to Payment model (already exists but not wired)

7. Add `lien_waiver_required` boolean to Commitment

8. Ensure SOVLine links back to CostCode properly (currently optional — should be required for new records)

**Changes to `backend/models/extended.py`:**

1. Fix LeadProposal field naming:
   - Add `proposal_amount` as alias/property for `client_price` OR rename `client_price` → `proposal_amount`
   - Add `sent_date = Column(Date)` and `approved_date = Column(Date)` fields

2. Add `confidence` to CashForecastLine (already exists: `confidence = Column(String(20))` — good)

**Deliverable**: Alembic migration that applies all model changes.

**Acceptance criteria**:
- `alembic upgrade head` succeeds
- All foreign key relationships from DATA_RELATIONSHIPS.md are queryable
- CostEvent → Commitment → Vendor → Project chain is traceable via SQLAlchemy relationships

### 1.2 Build Business Logic Layer

**New file**: `backend/services/job_costing.py`

This is the brain of the system. Pure Python functions, no HTTP concerns.

```python
class JobCostingService:
    """Core job costing calculations — no UI, no API, just math."""

    def get_cost_code_summary(self, project_id, cost_code_id) -> dict:
        """Returns: original_budget, approved_cos, revised_budget,
        committed, actual, eac, etc, variance, percent_spent"""

    def get_project_summary(self, project_id) -> dict:
        """Rollup of all cost codes: total budget, committed, actual, EAC, margin"""

    def get_variance_waterfall(self, project_id, cost_code_id=None) -> list:
        """Returns waterfall segments: scope, quantity, price, rework, etc.
        Each segment = list of cost_event_ids that contribute"""

    def get_uncommitted_budget(self, project_id) -> list:
        """Cost codes with budget but no commitment — procurement risk"""

    def calculate_eac(self, project_id, cost_code_id) -> Decimal:
        """EAC = Actual + Remaining Committed + Estimated Uncommitted"""

    def get_over_under_billing(self, project_id) -> list:
        """Per SOV line: earned (% × value) vs billed (sum of draws)"""
```

**New file**: `backend/services/cash_flow.py`

```python
class CashFlowService:
    """13-week cash forecast engine."""

    def build_forecast(self, weeks=13) -> list:
        """For each week: opening, inflows (draws, AR, other),
        outflows (AP, payroll, debt, recurring), closing, risk flags"""

    def get_week_detail(self, week_date) -> dict:
        """Breakdown: each inflow/outflow with confidence, source record IDs"""

    def run_scenario(self, adjustments: dict) -> list:
        """What-if: delay a draw, push a payable, add unexpected cost"""
```

**New file**: `backend/services/change_orders.py`

```python
class ChangeOrderService:
    """CO impact chain: CO → budget → SOV → forecast → margin."""

    def approve_co(self, co_id) -> dict:
        """Approves CO and cascades:
        1. Updates CostCode.budget_amount
        2. Updates/creates SOVLine.scheduled_value
        3. Recalculates Project.budget_total and .contract_amount
        4. Recalculates EAC and margin
        Returns: summary of all changes made"""

    def reject_co(self, co_id, reason) -> dict:
        """Rejects CO, records reason, notifies submitter"""

    def get_co_impact_preview(self, co_id) -> dict:
        """Before approving: shows what budget/margin/billing changes will occur"""

    def get_unbilled_cos(self, project_id) -> list:
        """Approved COs not yet included in a draw"""
```

**New file**: `backend/services/billing.py` (not Stripe — construction billing)

```python
class BillingService:
    """Draw/pay application creation and management."""

    def create_draw(self, project_id, line_items: list) -> PayApp:
        """Creates pay app from SOV line selections.
        Calculates: this_period, total_completed, %, retainage, balance"""

    def generate_g702(self, pay_app_id) -> dict:
        """Returns data for AIA G702 (Application for Payment)"""

    def generate_g703(self, pay_app_id) -> dict:
        """Returns data for AIA G703 (Continuation Sheet)"""

    def get_lien_waiver_checklist(self, pay_app_id) -> list:
        """Which vendors need lien waivers for this draw?
        Status: received, pending, missing"""

    def submit_draw(self, pay_app_id) -> dict:
        """Changes status, validates completeness, flags missing docs"""
```

**New file**: `backend/services/payments.py`

```python
class PaymentService:
    """Vendor payment processing with lien waiver enforcement."""

    def process_vendor_payment(self, vendor_id, commitment_id, amount, ...) -> Payment:
        """Creates payment, updates commitment balances,
        checks lien waiver requirement, calculates retainage"""

    def check_lien_waiver_status(self, vendor_id, project_id) -> dict:
        """Returns: required?, conditional received?, unconditional received?"""

    def release_retainage(self, retainage_entry_id) -> dict:
        """Requires: final lien waiver, project completion or milestone"""
```

**Deliverable**: Service classes with full unit test coverage.

**Acceptance criteria**:
- `JobCostingService.get_variance_waterfall()` returns segments that sum to total variance
- `ChangeOrderService.approve_co()` cascades to all affected entities
- `CashFlowService.build_forecast()` produces 13 weeks with correct math
- `BillingService.create_draw()` produces valid G702/G703 data
- All services tested with sample data from masterfile import

### 1.3 Set Up Alembic Migrations

**Files to create:**
- `alembic.ini`
- `alembic/env.py`
- `alembic/versions/001_initial.py` (from current models)
- `alembic/versions/002_model_fixes.py` (from 1.1 changes)

**Acceptance**: `alembic upgrade head` creates a clean database. `alembic downgrade -1` reverses last migration.

---

## Phase 2: Drilldown API Layer (Week 1-2)

### 2.1 Dashboard API — With Full Drill Paths

**Rewrite**: `backend/api/dashboard.py`

Replace current dashboard endpoint with multiple granular endpoints that support drilling:

```
GET /api/dashboard                        → Top-level KPIs (same as now, but with correct math)
GET /api/dashboard/margin-ranking         → Projects ranked by margin delta
GET /api/dashboard/cash-breakdown         → Cash position: bank + inflows + outflows
GET /api/dashboard/ar-summary             → AR aging buckets with totals
GET /api/dashboard/alerts                 → Alert queue with sources and actions
```

Fix calculation bugs:
- AP = actual payables (commitment.remaining + recurring due), not Debt(type=other)
- Remaining draws = budget - SUM(pay_apps.amount_approved), not budget - contract
- Avg % complete = AVG(project-level percent_complete from SOV), not spending rate

### 2.2 Job Costing API — Full Depth

**Rewrite**: `backend/api/projects.py`

Add drilldown endpoints that match the architecture map:

```
GET /api/projects/{id}/summary            → Project header with all calculated fields
GET /api/projects/{id}/costs              → Cost codes with budget/committed/actual/eac/variance
GET /api/projects/{id}/costs/{cc_id}      → Single cost code detail
GET /api/projects/{id}/costs/{cc_id}/events → Transactions for this cost code
GET /api/projects/{id}/costs/{cc_id}/commitments → POs/subs for this cost code
GET /api/projects/{id}/costs/{cc_id}/variance → Variance waterfall for this code

GET /api/projects/{id}/commitments        → All commitments for project
GET /api/projects/{id}/commitments/{c_id} → Commitment detail with invoices/payments

GET /api/projects/{id}/sov                → SOV table (G703 format)
GET /api/projects/{id}/sov/{line_id}      → SOV line detail with billing history

GET /api/projects/{id}/draws              → Pay app list
GET /api/projects/{id}/draws/{pa_id}      → Pay app detail (G702 data)
GET /api/projects/{id}/draws/{pa_id}/g703 → G703 continuation sheet data
GET /api/projects/{id}/draws/{pa_id}/waivers → Lien waiver checklist

GET /api/projects/{id}/cos                → Change order log
GET /api/projects/{id}/cos/{co_id}        → CO detail with budget/billing/margin impact
GET /api/projects/{id}/cos/{co_id}/impact → Preview: what changes if this CO is approved

GET /api/projects/{id}/variance           → Project-level variance waterfall
GET /api/projects/{id}/wip                → Work-in-progress (earned vs billed)
GET /api/projects/{id}/cashflow           → Project-level cash forecast
GET /api/projects/{id}/activity           → Audit log / change history
```

### 2.3 Cash Flow API — With Drill Depth

**New file**: `backend/api/cashflow.py`

```
GET /api/cashflow/forecast                → 13-week forecast grid
GET /api/cashflow/forecast/{week}         → Week detail: all inflows/outflows with sources
GET /api/cashflow/forecast/{week}/inflows → Inflow detail: draws, AR, other
GET /api/cashflow/forecast/{week}/outflows → Outflow detail: AP, payroll, debt, recurring
GET /api/cashflow/scenario                → POST: run what-if scenario
```

### 2.4 AR/Collections API — With Drill Depth

**Enhance**: `backend/api/financials.py`

```
GET /api/financials/ar                    → AR aging table with buckets
GET /api/financials/ar/aging-summary      → Bucket totals + DSO
GET /api/financials/ar/{invoice_id}       → Invoice detail with payment history
GET /api/financials/ar/by-customer        → Grouped by customer
GET /api/financials/ar/by-project         → Grouped by project
GET /api/financials/ar/collections-queue  → Past-due sorted by priority
```

### 2.5 Change Order API — With Impact Chain

**Enhance**: `backend/api/projects.py` (CO endpoints)

```
GET /api/projects/{id}/cos/{co_id}/impact → Budget/SOV/forecast/margin impact preview
POST /api/projects/{id}/cos/{co_id}/approve → Approve + cascade all updates
POST /api/projects/{id}/cos/{co_id}/reject → Reject + notify
GET /api/co/pending                       → Cross-project pending CO queue
GET /api/co/impact-summary                → Cross-project CO impact report
```

### 2.6 Vendor API — With Drill Depth

**Enhance**: `backend/api/vendors.py`

```
GET /api/vendors/{id}/financial-summary   → Total committed/invoiced/paid/retainage
GET /api/vendors/{id}/commitments         → All POs/subs
GET /api/vendors/{id}/payments            → Payment history
GET /api/vendors/{id}/lien-waivers        → Waiver status by project
GET /api/vendors/{id}/performance         → Projects, COs, defects, scores over time
GET /api/vendors/compliance               → Insurance/W9/license status dashboard
```

**Acceptance criteria for all Phase 2 APIs**:
- Every KPI on dashboard can be clicked → API returns the drill-down data
- Job costing supports: project → cost code → commitment → invoice/payment path
- Cash forecast returns source record IDs for every line item
- CO approve endpoint cascades to budget + SOV + margin (verified by re-querying)
- All endpoints return data that maps to the DRILLDOWN_ARCHITECTURE.md paths

---

## Phase 3: CRUD + Workflow Actions (Week 2)

### 3.1 Auth & Role Enforcement

**New file**: `backend/core/auth.py`

```python
def get_current_user(db, token) -> UserAccount
def require_role(*roles) -> Dependency
def require_project_access(project_id) -> Dependency
```

**Apply to all endpoints**:
- All read endpoints: `Depends(get_current_user)`
- Write endpoints: `Depends(require_role("admin", "pm", "cfo"))`
- Project-specific: `Depends(require_project_access(project_id))`
- Admin endpoints: `Depends(require_role("admin"))`

### 3.2 Project CRUD + Actions

```
POST /api/projects                        → Create project
PUT  /api/projects/{id}                   → Update project
PATCH /api/projects/{id}/status           → Change status (with validation)

POST /api/projects/{id}/cost-codes        → Add cost code
PUT  /api/projects/{id}/cost-codes/{cc}   → Update cost code
POST /api/projects/{id}/cost-codes/transfer → Transfer budget between codes

POST /api/projects/{id}/cost-events       → Record a cost (manual entry)
PUT  /api/projects/{id}/cost-events/{e}   → Update (recode, adjust)
POST /api/projects/{id}/cost-events/{e}/recode → Move to different code/project
POST /api/projects/{id}/cost-events/{e}/flag → Flag for review
```

### 3.3 Commitment CRUD + Actions

```
POST /api/projects/{id}/commitments       → Create PO/subcontract
PUT  /api/projects/{id}/commitments/{c}   → Update
POST /api/projects/{id}/commitments/{c}/invoice → Record vendor invoice against PO
POST /api/projects/{id}/commitments/{c}/co → Issue CO to commitment
PATCH /api/projects/{id}/commitments/{c}/close → Close out commitment
```

### 3.4 Pay Application CRUD + Actions

```
POST /api/projects/{id}/draws             → Create draft draw
PUT  /api/projects/{id}/draws/{pa}        → Edit draft
POST /api/projects/{id}/draws/{pa}/lines  → Add/update line items
POST /api/projects/{id}/draws/{pa}/submit → Submit (validates completeness)
POST /api/projects/{id}/draws/{pa}/approve → Approve (CFO/Owner only)
POST /api/projects/{id}/draws/{pa}/fund   → Mark as funded
GET  /api/projects/{id}/draws/{pa}/pdf    → Generate G702/G703 PDF
```

### 3.5 Change Order CRUD + Actions

```
POST /api/projects/{id}/cos               → Create CO
PUT  /api/projects/{id}/cos/{co}          → Update
POST /api/projects/{id}/cos/{co}/approve  → Approve + cascade all impacts
POST /api/projects/{id}/cos/{co}/reject   → Reject + notify
POST /api/projects/{id}/cos/{co}/escalate → Escalate to owner
POST /api/projects/{id}/cos/{co}/bill     → Include in next draw SOV
```

### 3.6 Payment + Lien Waiver Actions

```
POST /api/payments/vendor                 → Process vendor payment
POST /api/payments/draw-receipt           → Record draw receipt
POST /api/payments/retainage-release      → Release retainage

POST /api/lien-waivers                    → Create/upload lien waiver
PUT  /api/lien-waivers/{id}               → Update status
GET  /api/lien-waivers/missing            → Waivers needed but not received
```

### 3.7 Invoice / AR Actions

```
POST /api/financials/invoices             → Create invoice
POST /api/financials/invoices/{id}/payment → Record payment received
POST /api/financials/invoices/{id}/remind  → Send reminder (log action)
POST /api/financials/invoices/{id}/flag    → Flag dispute
```

**Acceptance criteria for Phase 3**:
- Auth enforced on every endpoint (401 without token, 403 without role)
- CO approval cascades: budget_amount + SOVLine + contract_amount + margin all update
- Draw creation validates: SOV balances, retainage calc, lien waiver checklist
- Vendor payment checks lien waiver requirement before processing
- Every action is logged in audit_log table

---

## Phase 4: Testing (Parallel with Phases 1-3)

### 4.1 Test Infrastructure

**Files**:
- `tests/conftest.py` — test DB, fixtures, sample data factory
- `tests/factories.py` — model factories for test data creation

### 4.2 Service Layer Tests

```
tests/test_job_costing.py        → Variance waterfall, EAC, rollups
tests/test_cash_flow.py          → 13-week forecast, scenario engine
tests/test_change_orders.py      → CO approval cascade (budget→SOV→margin)
tests/test_billing.py            → Draw creation, G702/G703 data, retainage
tests/test_payments.py           → Vendor payment with lien waiver check
```

### 4.3 API Integration Tests

```
tests/test_api_dashboard.py      → KPI correctness
tests/test_api_projects.py       → CRUD + drilldown endpoints
tests/test_api_auth.py           → Signup, login, role enforcement
tests/test_api_crm.py            → Fixed schemas, correct data
tests/test_api_financials.py     → AR, P&L, cash forecast
```

### 4.4 Cascade Tests (Critical)

```
tests/test_cascades.py
  - Create CO → approve → verify budget changed
  - Create CO → approve → verify SOV updated
  - Create CO → approve → verify margin recalculated
  - Create draw → verify SOV updated
  - Record payment → verify commitment remaining updated
  - Record payment → verify cash forecast adjusted
```

**Acceptance**: 80%+ coverage on services and API endpoints. All cascade tests pass.

---

## Phase 5: Frontend Rebuild (Week 3-4)

Only now do we touch the frontend. And we rebuild it against the architecture, not against the old demo data.

### 5.1 Auth Foundation
- `AuthContext.jsx` — JWT storage, user state, role info
- `ProtectedRoute.jsx` — redirect to login if not authenticated
- `Login.jsx` — real API call
- `api.js` — auth headers on all requests, 401 handling

### 5.2 Dashboard — Operational, Not Decorative
- Every KPI card links to drill endpoint
- Charts use real API data
- Click chart segment → navigate to filtered view
- Alerts are actionable (dismiss, flag, navigate to source)
- No demo data. No `||` fallbacks. If data is loading, show skeleton. If no data, show empty state.

### 5.3 Project Operating View — Full Drill Depth
- Overview tab: real project summary from `/api/projects/{id}/summary`
- Cost Codes tab: full table from `/api/projects/{id}/costs`
  - Click cost code → detail view with events, commitments, variance
  - Each transaction clickable → modal with source detail
- Commitments tab: from `/api/projects/{id}/commitments`
  - Click PO → detail with invoices, payments, retainage, lien waivers
- SOV tab: from `/api/projects/{id}/sov`
  - "Create Draw" button → draw creation flow
- Draws tab: from `/api/projects/{id}/draws`
  - Click draw → detail with G702/G703 data, waiver checklist
- Change Orders: from `/api/projects/{id}/cos`
  - "Approve" button → shows impact preview → confirms → cascades
- Variance tab: from `/api/projects/{id}/variance`
  - Waterfall chart where each segment is clickable → filtered transactions
- All other tabs: wired to real APIs

### 5.4 Financial Modules — Full Drill Depth
- AR with aging buckets, click to invoice detail
- Cash forecast with 13-week grid, click week to see drivers
- P&L with correct year defaults and account classification
- Retainage with receivable/payable split, release workflow
- Transaction log with filters, search, export

### 5.5 Vendor Module — With Compliance
- Vendor list with scorecard columns
- Detail with: financial summary, commitments, payments, lien waivers, performance
- Compliance dashboard: expiring insurance, missing W9s, waiver gaps

### 5.6 CRM Module — Fixed and Wired
- Leads, proposals, pipeline — all from fixed API endpoints
- Pipeline funnel chart with clickable segments
- Actions: update status, assign, convert to project

### 5.7 Team Module — Operational
- Crew allocation matrix with real data
- Click employee → detail with cost allocation
- Payroll calendar from real API

### 5.8 Payments Hub — Functional
- "Pay a Vendor" form that actually processes payments via API
- "Request a Draw" flow that creates pay apps via API
- Payment history with real data

### 5.9 Delete demoData.js
The file `frontend/src/components/jobcosting/demoData.js` is deleted entirely. Zero demo data anywhere in the frontend.

---

## Phase 6: AIA Documents & Reports (Week 4)

### 6.1 G702/G703 PDF Generation
Using reportlab or weasyprint.

### 6.2 WIP Report
Standard construction WIP schedule.

### 6.3 Job Cost Report
Printable budget vs actual by cost code.

### 6.4 Cash Forecast Report
Exportable 13-week forecast.

### 6.5 Variance Report
Printable variance analysis with root causes.

---

## Revised Timeline

```
Week 1:  Phase 1 (data model + services + Alembic)
         Phase 2.1-2.3 (dashboard + job costing + cashflow APIs)
         Phase 4.1-4.2 (test infra + service tests — parallel)

Week 2:  Phase 2.4-2.6 (AR + CO + vendor APIs)
         Phase 3 (CRUD + workflow actions + auth)
         Phase 4.3-4.4 (API tests + cascade tests — parallel)

Week 3:  Phase 5.1-5.4 (auth + dashboard + project detail + financials)
         Continue Phase 4 (tests for new frontend paths)

Week 4:  Phase 5.5-5.9 (vendors + CRM + team + payments + delete demo data)
         Phase 6 (PDF generation + reports)
```

---

## Acceptance Criteria — Definition of Done

The system is "architecture complete" when:

1. **Every top-level KPI drills to source records** — verified by clicking through 3+ levels in the UI
2. **Job costing supports**: project → phase → cost code → vendor/sub → PO/invoice/payment — verified with real imported data
3. **Variance views include root-cause breakdowns** — scope/quantity/price/rework tags on cost events, waterfall chart sums to total variance
4. **Change orders cascade**: CO approved → budget_amount updated → SOVLine updated → EAC recalculated → margin recalculated — verified by database query after approval
5. **AR/retainage drillable to invoice-level** — AR aging → click bucket → click invoice → see payments + source draw + lien waivers
6. **Drilldowns lead to actions** — every terminal view has at least one action button (flag, assign, approve, escalate, update forecast)
7. **Role-based views exist** — Owner sees margin/cash/risk first, PM sees their projects and cost codes, Ops sees crew and schedule
8. **Zero demo data** — demoData.js deleted, no `||` fallbacks, no hardcoded arrays
9. **All business logic tested** — service layer has >80% coverage, cascade tests pass
10. **Auth enforced everywhere** — no endpoint accessible without token, no action available without correct role
