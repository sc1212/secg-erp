# SECG ERP — Data Relationships & Financial Traceability

**Date**: 2026-02-21
**Purpose**: Define how every record connects to every other record. Map the financial flows that the system must enforce. Every number must be traceable to its source.

---

## 1. Core Entity Relationship Map

### Primary Chains

```
CLIENT
 └── PROJECT
      ├── COST_CODE (budget line items)
      │    ├── COMMITMENT (PO/subcontract against this code)
      │    │    ├── COST_EVENT (invoices/bills against this PO)
      │    │    ├── CHANGE_ORDER (changes to this commitment)
      │    │    └── PAYMENT (payments against this commitment)
      │    ├── COST_EVENT (direct costs coded here)
      │    ├── QUOTE (vendor bids for this scope)
      │    └── VARIANCE (budget - committed - actual)
      │
      ├── SOV_LINE (schedule of values for billing)
      │    ├── PAY_APP_LINE (amount billed per draw)
      │    └── Over/Under Billing (earned vs billed)
      │
      ├── PAY_APP (draw request to lender/owner)
      │    ├── PAY_APP_LINE (one per SOV line)
      │    ├── LIEN_WAIVER (required per draw)
      │    └── RETAINAGE (held on this draw)
      │
      ├── CHANGE_ORDER (scope/price changes)
      │    ├── → Updates COST_CODE.budget_amount
      │    ├── → Updates SOV_LINE.scheduled_value
      │    └── → Affects PROJECT margin forecast
      │
      ├── COMMITMENT (PO/subcontract)
      │    ├── VENDOR (who the commitment is with)
      │    ├── COST_CODE (which budget line)
      │    ├── COST_EVENT (invoices against this PO)
      │    ├── RETAINAGE_ENTRY (retainage held)
      │    └── LIEN_WAIVER (required for payment)
      │
      ├── INVOICE (what we bill to owner/client)
      │    ├── INVOICE_LINE
      │    └── PAYMENT (received)
      │
      ├── PROJECT_MILESTONE (schedule)
      ├── CREW_ALLOCATION (labor)
      └── DOCUMENT (linked files)

VENDOR
 ├── COMMITMENT (POs/subcontracts)
 ├── COST_EVENT (bills/invoices from vendor)
 ├── QUOTE (bids)
 ├── PAYMENT (what we paid them)
 ├── RETAINAGE_ENTRY (what we hold back)
 ├── LIEN_WAIVER (waiver status per draw)
 └── SCORECARD (quality/timeliness/communication/price)

EMPLOYEE
 ├── PAYROLL_ENTRY (pay period records)
 ├── CREW_ALLOCATION (project assignments)
 └── → Costs flow to PROJECT via allocation
```

---

## 2. Financial Flow Chains

### Chain A: Budget → Commitment → Cost → Payment (Job Costing)

This is the core job costing chain. Every dollar must be traceable through this path.

```
ORIGINAL BUDGET (Project.budget_total, CostCode.budget_amount)
    │
    ├── + CHANGE_ORDERS (approved)
    │   ChangeOrder.amount → adds to CostCode.budget_amount
    │   ∴ REVISED BUDGET = Original + Approved COs
    │
    ├── COMMITTED (Commitment.original_amount + Commitment.approved_cos)
    │   Commitment links to: Vendor + CostCode
    │   ∴ COMMITTED = SUM(commitments for this cost code)
    │   ∴ UNCOMMITTED BUDGET = Revised Budget - Committed
    │
    ├── ACTUAL COSTS (CostEvent.amount where project_id + cost_code_id match)
    │   Each CostEvent has: vendor, date, type, source, reference#
    │   ∴ ACTUAL = SUM(cost_events for this cost code)
    │
    ├── ESTIMATE AT COMPLETION (EAC)
    │   EAC = Actual + Remaining Committed + Estimated Uncommitted
    │   Where:
    │     Remaining Committed = Commitment.revised_amount - Commitment.billed_to_date
    │     Estimated Uncommitted = manual estimate or trend extrapolation
    │
    └── VARIANCE
        Variance = Revised Budget - EAC
        If negative → over budget → needs action
        Root cause tags: scope_change, quantity, price, rework, estimate_error, weather
```

**Traceability Rule**: For any variance number, you must be able to click through to the specific cost events, commitments, and change orders that caused it.

### Chain B: SOV → Draw → Payment → Cash (Revenue/Billing)

```
CONTRACT AMOUNT (Project.contract_amount)
    │
    ├── + APPROVED CHANGE ORDERS → REVISED CONTRACT
    │
    ├── SOV LINES (SOVLine.scheduled_value)
    │   SUM(scheduled_value) must = Revised Contract Amount
    │   Each line maps to a cost code
    │
    ├── PAY APPLICATION (draw request)
    │   PayApp contains PayAppLines (one per SOV line)
    │   PayAppLine.this_period = work completed this draw
    │   PayAppLine.total_completed = cumulative through this draw
    │   PayAppLine.percent_complete = total_completed / scheduled_value
    │   PayAppLine.balance_to_finish = scheduled_value - total_completed
    │   PayAppLine.retainage = total_completed × retainage_rate
    │
    │   PayApp.amount_requested = SUM(this_period) for all lines
    │   PayApp.retainage_held = SUM(retainage) for all lines
    │   PayApp.net_payment = amount_approved - retainage_held
    │
    ├── INVOICE (generated from PayApp)
    │   Invoice.amount = PayApp.net_payment
    │   Invoice.project_id = PayApp.project_id
    │   → Enters AR aging
    │
    ├── PAYMENT RECEIVED
    │   Payment links to Invoice
    │   Invoice.amount_paid updated
    │   Invoice.balance = amount - amount_paid
    │   → Cash on hand increases
    │
    └── RETAINAGE RELEASE (at project completion)
        RetainageEntry.amount_released
        → Final invoice for retainage
        → Cash on hand increases
```

**Traceability Rule**: From any draw, you must be able to see which SOV lines were billed, what % complete was claimed, what retainage was held, and whether the draw has been funded.

### Chain C: Change Order Impact Chain

```
CHANGE ORDER CREATED
    │
    ├── Status: Draft → Pending Approval → Approved/Rejected
    │
    ├── IF APPROVED:
    │   ├── BUDGET IMPACT
    │   │   CostCode.budget_amount += CO.amount (allocated to affected cost codes)
    │   │   Project.budget_total recalculated
    │   │
    │   ├── SOV IMPACT
    │   │   SOVLine.scheduled_value adjusted (new line or existing line updated)
    │   │   Total SOV must still = revised contract amount
    │   │
    │   ├── CONTRACT IMPACT
    │   │   Project.contract_amount += CO.amount
    │   │   (if owner-directed CO; internal COs may not change contract)
    │   │
    │   ├── FORECAST IMPACT
    │   │   EAC updated for affected cost codes
    │   │   Project margin recalculated:
    │   │     New Margin = Revised Contract - Revised EAC
    │   │
    │   ├── COMMITMENT IMPACT (if CO affects a subcontract)
    │   │   Commitment.approved_cos += CO.amount
    │   │   Commitment.revised_amount recalculated
    │   │
    │   └── BILLING IMPACT
    │       CO amount becomes billable on next draw
    │       Flag: "Approved CO not yet billed" → action item
    │
    └── TRACEABILITY
        From any CO, you can see:
        ├── Which cost codes were affected and by how much
        ├── How it changed the budget/EAC/margin
        ├── Whether it's been included in a draw
        └── The approval history (who, when, notes)
```

### Chain D: AR → Collections → Cash Forecast

```
INVOICE (accounts receivable)
    │
    ├── Status: Draft → Sent → Partial → Paid / Overdue
    │
    ├── AGING CALCULATION
    │   Age = today - date_due
    │   Bucket: Current (not due) | 1-30 | 31-60 | 61-90 | 90+
    │
    ├── COLLECTION ACTIONS
    │   Auto-reminder at: due date, 15 days, 30 days, 60 days
    │   Manual: call, email, statement, demand letter
    │   Each action logged with date and notes
    │
    ├── CASH FORECAST IMPACT
    │   Expected collection date = date_due + historical avg days late
    │   Confidence: High (current) → Medium (1-30) → Low (60+)
    │   Plugs into 13-week forecast as inflow
    │
    └── PAYMENT RECEIPT
        Payment.amount applied to Invoice.amount_paid
        Invoice.balance recalculated
        If fully paid → status = "paid"
        Cash on hand updated
        → Reconcile with bank statement
```

### Chain E: Vendor → Payment → Lien Waiver → Cash

```
VENDOR OWES US NOTHING. WE OWE VENDOR.

COMMITMENT (what we contracted for)
    │
    ├── VENDOR INVOICE RECEIVED
    │   CostEvent created (type=vendor_bill)
    │   Coded to: Project + CostCode
    │   Commitment.billed_to_date updated
    │
    ├── PAYMENT PROCESSING
    │   ├── CHECK: Is lien waiver required? (amount > threshold OR draw-related)
    │   │   ├── YES → Require conditional waiver before payment
    │   │   │   LienWaiver.waiver_type = "conditional"
    │   │   │   LienWaiver.amount = payment amount
    │   │   │   LienWaiver.through_date = billing period end
    │   │   └── After payment → Request unconditional waiver
    │   │       LienWaiver.waiver_type = "unconditional"
    │   │
    │   ├── CHECK: Retainage applicable?
    │   │   ├── YES → Hold retainage_rate × invoice amount
    │   │   │   RetainageEntry created
    │   │   │   Payment.amount = invoice - retainage
    │   │   └── NO → Pay full amount
    │   │
    │   ├── PAYMENT CREATED
    │   │   Payment.vendor_id, .project_id, .amount, .method, .reference#
    │   │   CostEvent updated (or new CostEvent for payment)
    │   │   Commitment.billed_to_date and .remaining updated
    │   │
    │   └── CASH IMPACT
    │       Cash on hand decreases
    │       AP outstanding decreases
    │       Cash forecast outflow realized
    │
    └── RETAINAGE RELEASE (at project completion or milestone)
        RetainageEntry.amount_released = retainage balance
        → Requires final/unconditional lien waiver
        → Payment created for retainage amount
        → Cash on hand decreases
```

### Chain F: Payroll → Labor → Job Cost

```
EMPLOYEE
    │
    ├── CREW_ALLOCATION (assignment to project + week)
    │   hours_allocated × hourly_rate = allocated_cost
    │   This cost flows to PROJECT → COST_CODE (labor category)
    │
    ├── PAYROLL_ENTRY (actual pay period record)
    │   gross_pay, employer_taxes, total_cost
    │   Allocated across projects based on CREW_ALLOCATION hours
    │
    ├── JOB COST IMPACT
    │   CostEvent created (type=labor)
    │   project_id from allocation
    │   cost_code_id = labor cost code for that project
    │   amount = hours × rate (or allocated portion of salary)
    │
    └── CASH IMPACT
        PayrollCalendar.total_employer_cost → cash outflow
        Flows into 13-week forecast as recurring outflow
```

---

## 3. Aggregation Rules

### Project-Level Rollups

```
Project.budget_total = SUM(CostCode.budget_amount) WHERE project_id = X
Project.contract_amount = original_contract + SUM(ChangeOrder.amount WHERE status=approved)
Project.total_committed = SUM(Commitment.revised_amount)
Project.total_actual = SUM(CostEvent.amount)
Project.total_billed = SUM(PayApp.amount_approved)
Project.total_collected = SUM(Payment.amount WHERE invoice.project_id = X)
Project.retainage_receivable = SUM(PayApp.retainage_held) - SUM(retainage released)
Project.retainage_payable = SUM(RetainageEntry.balance WHERE vendor_id IS NOT NULL)
Project.margin = contract_amount - EAC
Project.percent_complete = SUM(SOVLine.total_completed) / SUM(SOVLine.scheduled_value)
```

### Dashboard-Level Rollups

```
Cash_on_Hand = Latest CashSnapshot.balance
AR_Outstanding = SUM(Invoice.balance WHERE status IN (sent, overdue, partial))
AP_Outstanding = SUM(Commitment.remaining WHERE status = executed)
                + SUM(RecurringExpense WHERE due this period)
Remaining_Draws = SUM(Project.budget_total - total_drawn) WHERE status = active
Total_Debt = SUM(Debt.current_balance WHERE is_active = True)
Pipeline_Value = SUM(BidPipeline.estimated_value WHERE status NOT IN (won, lost))
Weighted_Pipeline = SUM(estimated_value × probability / 100)
Gross_Margin = SUM(project margins) / SUM(contract amounts)
```

### WIP (Work-in-Progress) Calculation

For each active project:
```
Earned_Revenue = % Complete × Contract Amount
Billed_to_Date = SUM(PayApp.amount_approved)
Over_Under_Billing = Billed_to_Date - Earned_Revenue
    If positive → Overbilled (liability — we billed more than we earned)
    If negative → Underbilled (asset — we earned more than we billed)

Cost_Method_% = Total_Actual / EAC × 100
Revenue_Recognized = Cost_Method_% × Contract_Amount
```

---

## 4. Referential Integrity Rules

### Hard Constraints (must enforce)

| Parent | Child | Rule |
|--------|-------|------|
| Project | CostCode | Cannot delete project with cost codes |
| Project | SOVLine | Cannot delete project with SOV lines |
| Project | PayApp | Cannot delete project with pay apps |
| Project | Commitment | Cannot delete project with commitments |
| CostCode | CostEvent | Cannot delete cost code with transactions |
| CostCode | Commitment | Cannot delete cost code with commitments |
| Vendor | Commitment | Cannot delete vendor with active commitments |
| Vendor | CostEvent | Cannot delete vendor with transactions |
| PayApp | PayAppLine | Cascade delete (draft only) |
| Invoice | Payment | Cannot void invoice with payments |

### Soft Constraints (warn but allow)

| Check | Warning |
|-------|---------|
| CostCode.actual > CostCode.budget_amount | "Cost code over budget" alert |
| Commitment.billed_to_date > Commitment.revised_amount | "PO overbilled" warning |
| SOV total ≠ contract amount | "SOV doesn't balance with contract" |
| PayApp without lien waivers | "Missing lien waivers for this draw" |
| Payment > $5000 without lien waiver | "Large payment without lien waiver" |
| Project % complete jumps > 10% in one draw | "Unusual billing jump — verify" |

### Cascade Updates (system must auto-calculate)

| Trigger | Updates |
|---------|---------|
| ChangeOrder approved | → CostCode.budget_amount, SOVLine.scheduled_value, Project.budget_total, Project.contract_amount |
| CostEvent created | → CostCode.actual_amount, CostCode.variance, Project.total_actual |
| Commitment created/updated | → CostCode.committed_amount, CostCode.variance |
| PayApp approved | → SOVLine.total_completed, SOVLine.percent_complete, SOVLine.balance_to_finish, Project total billed |
| Payment recorded (AR) | → Invoice.amount_paid, Invoice.balance, Invoice.status |
| Payment recorded (AP) | → Commitment.billed_to_date, Commitment.remaining |
| RetainageEntry released | → Retainage totals recalculated |

---

## 5. Data Source Traceability

Every record should know where it came from.

| Record Type | Possible Sources | Tracking Fields |
|-------------|-----------------|-----------------|
| CostEvent | Manual, QBO Sync, Masterfile Import, CSV Import, Ramp, Lowes, HD | `source` (enum), `source_ref`, `import_batch`, `qb_txn_id` |
| Project | Manual, Masterfile Import, BuilderTrend | `qb_class_id` |
| Vendor | Manual, Masterfile Import | `qb_vendor_id` |
| Employee | Manual, Masterfile Import | `qb_employee_id` |
| Invoice | Manual, Draw-generated, QBO Sync | `qb_txn_id` |
| Commitment | Manual, Masterfile Import | `qb_txn_id` |
| Lead | BuilderTrend Import | `source` field |
| Debt | Manual, Masterfile Import | — |
| PLEntry | Masterfile Import | `period_year`, `period_month`, `division` |

**Rule**: When clicking "View Source" on any imported record, the system should show which import batch created it, when, and from which file/tab.

---

## 6. Entity Counts (Current Schema)

| Entity | Table | Current Model Status |
|--------|-------|---------------------|
| Client | clients | Model exists, no API CRUD |
| Employee | employees | Model + read API, no CRUD |
| Vendor | vendors | Model + read API, no CRUD |
| Project | projects | Model + read API, no CRUD |
| CostCode | cost_codes | Model + read API, no CRUD |
| Contract | contracts | **ORPHAN** — model exists, never used |
| Commitment | commitments | Model exists, no API |
| ChangeOrder | change_orders | Model + read API, no CRUD |
| CostEvent | cost_events | Model + read API, no CRUD |
| Quote | quotes | Model + read API (via projects), no CRUD |
| SOVLine | sov_lines | Model + read API, no CRUD |
| PayApp | pay_apps | Model + read API, no CRUD |
| PayAppLine | pay_app_lines | Model exists, no API |
| Invoice | invoices | Model + read API, no CRUD |
| InvoiceLine | invoice_lines | **ORPHAN** |
| Payment | payments | **ORPHAN** — model exists, never used |
| Document | documents | **ORPHAN** |
| DocumentVersion | document_versions | **ORPHAN** |
| DocumentLink | document_links | **ORPHAN** |
| WorkflowTask | workflow_tasks | **ORPHAN** |
| AuditLog | audit_log | Model exists, log_audit() never called |
| Debt | debts | Model + read API |
| Property | properties | Model + read API |
| ChartOfAccounts | chart_of_accounts | Model exists, not used by P&L |
| RecurringExpense | recurring_expenses | Model + read API |
| CashSnapshot | cash_snapshots | Model + dashboard query |
| CashForecastLine | cash_forecast_lines | Model + read API |
| PhaseSyncEntry | phase_sync_entries | Model exists, no API |
| PayrollEntry | payroll_entries | Model exists, no API |
| PayrollCalendar | payroll_calendar | Model + read API |
| PLEntry | pl_entries | Model + read API |
| Scenario | scenarios | Model exists, no API |
| ScenarioAssumption | scenario_assumptions | Model exists, no API |
| DataSource | data_sources | Model + import logging |
| LienWaiver | lien_waivers | Model + read API |
| ProjectMilestone | project_milestones | Model + read API |
| RetainageEntry | retainage_entries | Model + read API |
| BidPipeline | bid_pipeline | Model + read API |
| CrewAllocation | crew_allocations | Model + read API |
| Lead | leads | Model + read API (buggy) |
| LeadProposal | lead_proposals | Model + read API (buggy) |
| BillingCustomer | billing_customers | Model + billing API |
| BillingSubscription | billing_subscriptions | Model + billing API |
| BillingEvent | billing_events | Model + billing API |
| UserAccount | user_accounts | Model + auth API |

**Summary**: 44 models. 7 orphans (never read or written by API or importer). ~25 have read APIs. 0 have write/update/delete APIs for business data.
