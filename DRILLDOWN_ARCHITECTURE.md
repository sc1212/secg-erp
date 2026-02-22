# SECG ERP — Drilldown Architecture Map

**Date**: 2026-02-21
**Purpose**: Define every drill path from top-level KPI → driver → entity → source record → transaction. No dead ends. Every terminal node has an action.

---

## Design Principle

Every number displayed on screen must answer three questions:
1. **What does this mean?** (context)
2. **Why is it this number?** (drill to drivers)
3. **What do I do about it?** (action)

If a metric cannot be drilled to its source records and does not offer an action, it does not belong in the system.

---

## Module 1: Executive Dashboard

### KPI: Gross Margin %

```
Gross Margin % (all active projects)
├── Click → Project Margin Ranking Table
│   Columns: Project | Contract | Costs to Date | EAC | Margin $ | Margin % | Δ vs Budget | Trend
│   Sorted by: Margin delta (worst first)
│   Actions: [Flag for Review] [Assign PM Action] [View Detail]
│   │
│   ├── Click Project → Job Cost Detail (Module 2)
│   │   └── Phase → Cost Code → Vendor/Sub → PO/Invoice/Payment chain
│   │
│   └── Click Margin Delta → Variance Waterfall
│       Shows: Original budget margin → scope changes → quantity overruns
│             → price increases → rework/warranty → current margin
│       Each waterfall segment clickable → filtered cost events
│       Actions: [Update Forecast] [Create CO] [Flag Vendor]
```

### KPI: Cash on Hand

```
Cash on Hand ($XXX,XXX)
├── Click → Cash Position Breakdown
│   ├── Bank Accounts (from CashSnapshot)
│   │   └── Click account → transaction history
│   ├── Pending Inflows
│   │   ├── Outstanding AR → drill to invoice list (Module 5)
│   │   ├── Approved Draws → drill to draw detail
│   │   └── Expected Collections → aging bucket drill
│   ├── Pending Outflows
│   │   ├── AP Due This Week → vendor/invoice list
│   │   ├── Payroll Due → payroll calendar entry
│   │   ├── Debt Payments Due → debt schedule entry
│   │   └── Recurring Expenses → recurring list
│   └── Net Position = Cash + Inflows - Outflows
│
│   Actions: [Flag Cash Risk] [Delay AP Payment] [Accelerate Draw]
```

### KPI: Accounts Receivable

```
AR Outstanding ($XXX,XXX)
├── Click → AR Aging Table
│   Buckets: Current | 1-30 | 31-60 | 61-90 | 90+
│   Columns: Customer/Project | Invoice# | Amount | Age | Status | Last Action
│   │
│   ├── Click Aging Bucket → Filtered invoice list
│   │   ├── Click Invoice → Invoice Detail
│   │   │   ├── Line items (from SOV/draw)
│   │   │   ├── Payment history
│   │   │   ├── Retainage held
│   │   │   ├── Related lien waivers
│   │   │   └── Source project/draw
│   │   │   Actions: [Send Reminder] [Record Payment] [Flag Dispute] [Escalate]
│   │   │
│   │   └── Click Project → Project billing history
│   │
│   └── Click Customer → Customer account view
│       All invoices, payments, credits, retainage for this customer
│       Actions: [Call] [Email] [Place on Hold] [Adjust Credit Terms]
```

### KPI: Active Projects

```
Active Projects (N)
├── Click → Project List (filtered: status=active)
│   Columns: Code | Name | Type | PM | Budget | % Complete | Margin | Status | Risk
│   Sort by: Risk level, then % complete
│   │
│   ├── Click Project → Project Operating View (Module 2)
│   ├── Click PM → PM Performance View
│   │   All projects for this PM: budget adherence, schedule, margin
│   │   Actions: [Reassign Project] [Schedule Review]
│   ├── Click Risk Flag → Risk Detail
│   │   What's causing risk: budget overrun, schedule slip, cash flow, lien exposure
│   │   Actions: [Escalate] [Create Action Item] [Adjust Forecast]
│   │
│   Filter by: Status | Type | PM | City | Risk Level | % Complete Range
│   Actions: [Export CSV] [Create New Project] [Bulk Assign PM]
```

### KPI: Pipeline Value

```
Pipeline Value ($X.XM)
├── Click → Pipeline Funnel View
│   Stages: Identified → Pursuing → Bid Submitted → Shortlisted → Won
│   Each stage shows: count, total value, weighted value
│   │
│   ├── Click Stage → Opportunity list filtered by stage
│   │   Columns: Opportunity | Client | Value | Probability | Salesperson | Due Date
│   │   ├── Click Opportunity → Opportunity Detail
│   │   │   ├── Client info
│   │   │   ├── Bid details (if submitted)
│   │   │   ├── Proposal history
│   │   │   ├── Timeline / milestones
│   │   │   └── Win/loss analysis (if decided)
│   │   │   Actions: [Update Status] [Assign Estimator] [Create Proposal]
│   │   │           [Convert to Project] [Mark Lost + Reason]
│   │   │
│   │   └── Click Salesperson → Salesperson pipeline
│   │
│   Actions: [Export Pipeline Report] [Create Opportunity]
```

### KPI: Total Debt

```
Total Debt ($XXX,XXX)
├── Click → Debt Schedule Table
│   Columns: Name | Lender | Type | Balance | Rate | Payment | Maturity | Project
│   Grouped by: Type (Construction Loans, Credit Cards, Other)
│   │
│   ├── Click Debt → Debt Detail
│   │   ├── Payment history
│   │   ├── Amortization schedule
│   │   ├── Linked project (for construction loans)
│   │   ├── Collateral
│   │   └── Maturity timeline
│   │   Actions: [Record Payment] [Refinance Analysis] [Pay Off] [Update Balance]
│   │
│   ├── Click Construction Loans subtotal → Construction loan detail
│   │   Shows: loan vs budget vs drawn vs remaining per project
│   │   Actions: [Request Draw] [Update Loan Balance]
│   │
│   └── Click Project → Project financial view
│
│   Actions: [Export Debt Schedule] [Add Debt] [Debt Payoff Calculator]
```

### KPI: Bi-Weekly Payroll

```
Bi-Weekly Payroll ($XX,XXX)
├── Click → Payroll Calendar View
│   Upcoming pay dates with estimated amounts
│   │
│   ├── Click Pay Date → Payroll Detail
│   │   ├── Employee breakdown (name, role, gross, taxes, net)
│   │   ├── Project allocation (hours × rate by project)
│   │   ├── Cash impact (total employer cost)
│   │   Actions: [Process Payroll] [Adjust Hours] [Review Allocation]
│   │
│   ├── Click Employee → Employee Cost Detail
│   │   ├── Rate history
│   │   ├── Project allocation history
│   │   ├── YTD costs
│   │   Actions: [Adjust Rate] [Reallocate] [Deactivate]
│   │
│   └── Actions: [Run Payroll Preview] [Export for ADP/Gusto]
```

### KPI: Retainage

```
Retainage Held ($XXX,XXX)
├── Click → Retainage Table
│   Two sections:
│   ├── Retainage Receivable (held by owner/lender on our draws)
│   │   Columns: Project | Draw # | Amount Held | % | Release Conditions
│   │   ├── Click Entry → Draw detail with retainage calc
│   │   Actions: [Request Release] [Update Amount]
│   │
│   └── Retainage Payable (we hold on subs)
│       Columns: Project | Vendor/Sub | Amount Held | % | Release Status
│       ├── Click Entry → Vendor payment detail
│       ├── Click Vendor → Vendor account with retainage history
│       Actions: [Release Retainage] [Request Lien Waiver First]
│
│   Actions: [Export Retainage Report] [Bulk Release (project closeout)]
```

---

## Module 2: Job Costing (Project Operating View)

This is the core operational module. Every project drills 6+ levels deep.

### Level 0: Project Header

```
Project: Walnut Grove Lot 1 (WG1)
├── Status: Active | Type: Custom Home | PM: John Smith
├── Contract: $450,000 | Budget: $412,000 | EAC: $425,000
├── % Complete: 68% | Margin: $25,000 (5.6%) | Budget Variance: -$13,000
├── Schedule: 12 days behind | Cash Position: $28,000 in draws remaining
│
├── [Tab] Budget & Cost Codes (Level 1)
├── [Tab] Commitments & POs
├── [Tab] Schedule of Values (SOV)
├── [Tab] Pay Applications / Draws
├── [Tab] Change Orders
├── [Tab] Schedule / Milestones
├── [Tab] Cash Flow (project-level)
├── [Tab] Variance Analysis
├── [Tab] Documents
├── [Tab] Activity Log
```

### Level 1: Budget & Cost Codes

```
Cost Code Table
Columns: Code | Description | Category | Original Budget | Approved COs
        | Revised Budget | Committed | Actual | EAC | Variance | % Spent
Grouped by: Category (Pre-Con, Site Work, Structure, MEP, Finishes, etc.)

├── Click Cost Code → Level 2: Cost Code Detail
│   ├── Budget History
│   │   Original → CO adjustments → Current revised budget
│   │   Each CO clickable → CO detail
│   │
│   ├── Commitments Table
│   │   All POs/subcontracts against this cost code
│   │   Columns: Vendor | PO# | Original | COs | Revised | Billed | Remaining | Status
│   │   ├── Click Commitment → Level 3: Commitment Detail
│   │   │   ├── Line items
│   │   │   ├── Change orders (to this commitment)
│   │   │   ├── Invoices received
│   │   │   ├── Payments made
│   │   │   ├── Retainage held
│   │   │   ├── Lien waiver status
│   │   │   Actions: [Issue CO] [Record Invoice] [Make Payment] [Request Lien Waiver]
│   │   │
│   │   └── Click Vendor → Vendor Account (Module 6)
│   │
│   ├── Actual Costs Table (Cost Events)
│   │   All transactions coded to this cost code
│   │   Columns: Date | Vendor | Description | Amount | Source | Reference# | Type
│   │   ├── Click Transaction → Level 4: Transaction Detail
│   │   │   ├── Source document (invoice image, receipt, etc.)
│   │   │   ├── Approval history
│   │   │   ├── Payment method / check #
│   │   │   ├── Linked PO/commitment
│   │   │   Actions: [Recode] [Void] [Flag for Review] [Attach Document]
│   │   │
│   │   Filter by: Date range | Vendor | Type | Source
│   │
│   ├── Variance Analysis (for this cost code)
│   │   Waterfall: Budget → Scope Change → Quantity → Price → Rework → EAC
│   │   Each segment clickable → transactions causing that variance
│   │   Actions: [Update EAC] [Request Budget Transfer] [Flag for CO]
│   │
│   └── Forecast
│       ETC (estimate to complete) based on:
│       ├── Committed remaining
│       ├── Known unbilled work
│       └── Trend extrapolation
│       Actions: [Override EAC] [Lock Forecast] [Add Note]
│
├── Click Category → Filtered cost codes by category
├── Click Variance column → Sorted by worst variance, links to variance analysis
│
│ Summary Row:
│ Total Budget | Total Committed | Total Actual | Total EAC | Total Variance
│ Actions: [Export Budget Report] [Print Job Cost Report] [Budget Revision]
```

### Level 2: Commitments & POs

```
Commitments Table
Columns: Vendor | Type (Sub/PO/T&M) | Scope | Original | Approved COs
        | Revised | Invoiced | Paid | Retainage | Remaining | Status | Lien Waiver

├── Click Commitment → Commitment Detail (see Level 3 above)
│
├── Uncommitted Budget Analysis
│   Cost codes with budget but no commitment yet
│   Columns: Cost Code | Budget | What's Missing
│   Actions: [Create PO] [Get Quotes] [Assign to Vendor]
│
├── Commitment vs Budget Comparison
│   Over-committed cost codes highlighted red
│   Under-committed shown as risk (work not locked in)
│   Actions: [Reallocate Budget] [Issue Change Order]
│
│ Actions: [Create New PO] [Create Subcontract] [Import from Bid]
```

### Level 3: Schedule of Values (SOV)

```
SOV Table (AIA G703 format)
Columns: Item# | Description | Scheduled Value | Previous Applications
        | This Period (Work Completed + Stored Materials)
        | Total Completed + Stored | % | Balance to Finish | Retainage

├── Click Line Item → SOV Line Detail
│   ├── Billing history (all pay apps for this line)
│   ├── Linked cost code and its actuals
│   ├── Over/under billing analysis
│   │   Earned (% complete × scheduled value) vs Billed (total applications)
│   │   If overbilled → flag risk
│   │   If underbilled → opportunity to bill more
│   Actions: [Adjust % Complete] [Add to Next Draw] [Split Line]
│
│ Totals: Total Scheduled | Total Completed | Total Retainage | Total Balance
│ Actions: [Create Pay App] [Generate G702/G703 PDF] [Submit Draw Request]
```

### Level 4: Pay Applications / Draws

```
Pay App List
Columns: Draw # | Period | Requested | Approved | Retainage | Net | Status | Date

├── Click Pay App → Pay App Detail
│   ├── G702 Summary (application for payment)
│   │   Contract sum, COs to date, total completed, retainage, amount due
│   ├── G703 Continuation Sheet (line-by-line)
│   │   Each SOV line with this period's work
│   ├── Supporting Documents
│   │   ├── Lien waivers received
│   │   ├── Inspection reports
│   │   ├── Photos
│   ├── Approval History
│   │   Submitted → Reviewed → Approved → Funded
│   │   Each step: who, when, notes
│   ├── Cash Impact
│   │   When funded, what it means for project cash flow
│   │
│   Actions: [Edit Lines] [Submit for Approval] [Approve] [Reject + Notes]
│           [Generate PDF] [Request Missing Lien Waivers] [Mark Funded]
│
│ Actions: [Create New Draw] [Compare Draws] [Export History]
```

### Level 5: Change Orders

```
CO Log
Columns: CO# | Title | Amount | Status | Requested By | Date | Budget Impact | Billing Status

├── Click CO → CO Detail
│   ├── Description & Scope
│   ├── Cost Breakdown
│   │   Which cost codes affected, amounts
│   ├── Budget Impact
│   │   Before CO: Budget = $X | After CO: Budget = $X + CO amount
│   │   Shows revised budget vs original
│   ├── Forecast Impact
│   │   How does this CO change the EAC and project margin?
│   │   Before: Margin = $Y | After: Margin = $Y + CO net impact
│   ├── Billing Status
│   │   Has this CO been included in a draw yet?
│   │   If approved but unbilled → flag for next draw
│   ├── Approval Trail
│   │   Requested → Priced → Submitted → Approved/Rejected
│   │   Each step: who, when, notes, documents
│   │
│   Actions: [Approve] [Reject] [Request Pricing] [Add to SOV]
│           [Update Budget] [Include in Next Draw] [Assign to Cost Code]
│
├── Pending COs Summary
│   Total pending amount, impact on margin if all approved
│   Actions: [Bulk Approve] [Export Pending COs] [Generate CO Log Report]
│
│ CO Impact Summary:
│ Original Contract | Approved COs | Pending COs | Revised Contract | Projected Contract
```

### Level 6: Variance Analysis (Project-Level)

```
Variance Waterfall Chart
Original Budget → +Scope Changes → +Quantity Variances → +Price Variances
                → +Rework/Warranty → -Value Engineering → Current EAC

├── Click Scope Changes → COs that changed scope + budget
├── Click Quantity → Cost codes where quantity exceeded estimate
│   Shows: Estimated qty × unit price vs Actual qty × unit price
│   └── Click cost code → transactions proving the overage
├── Click Price → Cost codes where unit price exceeded budget
│   Shows: Estimated price vs Actual/committed price
│   └── Click cost code → vendor bids vs actual contract
├── Click Rework → Cost events tagged as rework
│   Shows: vendor, cause, cost
│   Actions: [Back-charge Vendor] [Create Warranty Claim] [Flag for Future Bids]

Root Cause Tags (on each cost event):
- Scope change (owner-directed)
- Design error
- Estimating miss
- Vendor price increase
- Quantity overrun
- Rework / defect
- Weather / force majeure
- Code / permit change

Actions: [Generate Variance Report] [Flag for PM Review] [Update Forecast]
```

---

## Module 3: Cash Flow

### 13-Week Cash Forecast

```
Weekly Forecast Grid
Columns: Week | Opening Balance | Inflows | Outflows | Net | Closing Balance | Flag
Rows: 13 weeks forward

├── Click Week → Week Detail
│   ├── Inflows Breakdown
│   │   ├── Scheduled Draw Receipts
│   │   │   └── Click → Draw detail with approval status
│   │   ├── AR Collections Expected
│   │   │   └── Click → Invoice list by expected payment date
│   │   ├── Other Income
│   │   │   └── Click → transaction detail
│   │   Confidence: High (approved draws) | Medium (sent invoices) | Low (projected)
│   │
│   ├── Outflows Breakdown
│   │   ├── AP Due (vendor invoices)
│   │   │   └── Click → payable list, sortable by vendor/project
│   │   ├── Payroll
│   │   │   └── Click → payroll calendar entry
│   │   ├── Debt Service (loan payments)
│   │   │   └── Click → debt schedule entry
│   │   ├── Recurring Expenses
│   │   │   └── Click → recurring expense list
│   │   ├── Subcontractor Payments
│   │   │   └── Click → commitment payment schedule
│   │
│   ├── Cash Risk Assessment
│   │   If closing balance < threshold → RED flag
│   │   If draw receipt is uncertain → YELLOW flag
│   │   Scenario: "What if Draw #3 is delayed 2 weeks?"
│   │
│   Actions: [Adjust Forecast] [Delay AP Payment] [Accelerate Draw]
│           [Move Payroll Date] [Flag Cash Crunch]
│
├── Click Inflow/Outflow cell → filtered transaction list for that category + week
├── Click Flag → risk detail with suggested actions
│
│ Actions: [Export 13-Week Forecast] [Run What-If Scenario]
│         [Compare to Last Week's Forecast] [Email to CFO/Lender]
```

---

## Module 4: Change Order Management

```
CO Dashboard
├── Summary Cards
│   ├── Total Pending COs: $XX,XXX across N projects
│   ├── Approved This Month: $XX,XXX
│   ├── Net Budget Impact: +$XX,XXX
│   ├── Margin Impact: -X.X%
│
├── Pending CO Queue (sorted by age/value)
│   Columns: Project | CO# | Title | Amount | Days Pending | Requested By | PM
│   ├── Click CO → CO Detail (see Module 2 Level 5)
│   Actions: [Bulk Approve] [Assign Reviewer] [Export]
│
├── CO Trend Chart
│   Monthly CO volume and $ by project
│   ├── Click month → COs submitted that month
│   ├── Click project bar → project CO log
│
├── CO Impact Analysis
│   For each project: Original Contract → Approved COs → Current Contract → Margin Effect
│   ├── Click project → full CO chain with budget/billing/margin trace
│   │
│   Financial Chain:
│   CO Approved → Budget Revised (cost_codes.budget_amount updated)
│                → SOV Updated (sov_lines.scheduled_value adjusted)
│                → Forecast Updated (EAC recalculated)
│                → Next Draw includes CO amount
│                → Margin recalculated
│
│   Actions: [Generate CO Summary Report] [Review Aged COs] [CO Policy Alert]
```

---

## Module 5: AR / Billing / Retainage

```
AR Dashboard
├── Summary Cards
│   ├── Total AR Outstanding
│   ├── Current vs Past Due
│   ├── DSO (Days Sales Outstanding)
│   ├── Collection Rate (30/60/90 day)
│
├── Aging Table
│   Columns: Customer | Project | Invoice# | Amount | Date Issued | Due Date
│           | Age | Status | Last Action | Next Action
│   Buckets: Current | 1-30 | 31-60 | 61-90 | 90+
│   │
│   ├── Click Invoice → Invoice Detail
│   │   ├── Line items (from SOV/draw)
│   │   ├── Source draw/pay app
│   │   ├── Retainage on this invoice
│   │   ├── Payment history (partial payments)
│   │   ├── Collection notes/timeline
│   │   ├── Related lien waivers
│   │   ├── Supporting documents
│   │   Actions: [Send Reminder] [Record Payment] [Apply Credit]
│   │           [Flag Dispute] [Escalate to Owner] [Write Off]
│   │
│   ├── Click Customer → Customer Account
│   │   All invoices, payments, retainage, credit history
│   │   Actions: [Statement] [Payment Plan] [Credit Hold]
│   │
│   ├── Click Project → Project billing history
│   │   All draws, invoices, retainage for this project
│   │   Actions: [Create Invoice] [Submit Draw] [Release Retainage]
│
├── Retainage Sub-Module
│   ├── By Project: retainage held on each project
│   │   Release conditions, % held, accumulated amount
│   │   Actions: [Request Release] [Conditional Waiver]
│   │
│   ├── By Vendor: retainage we hold on subs
│   │   Actions: [Release Payment] [Require Final Lien Waiver]
│
├── Collections Queue
│   Past-due invoices sorted by amount, with recommended actions
│   Actions: [Auto-Send Reminders] [Assign Collector] [Generate Statement]
```

---

## Module 6: Vendor Management

```
Vendor Operating View
├── Vendor List
│   Columns: Name | Trade | Scorecard (1-5) | Active Projects | Open Commitments
│           | Total Paid YTD | Insurance Status | Lien Waiver Status
│   │
│   ├── Click Vendor → Vendor Detail
│   │   ├── Contact & Compliance
│   │   │   W9, insurance, license — status and expiry
│   │   │   Actions: [Request Updated Insurance] [Request W9]
│   │   │
│   │   ├── Scorecard
│   │   │   Quality, Timeliness, Communication, Price — 1-5 each
│   │   │   Trend over time
│   │   │   Actions: [Update Scores] [Add Review Note]
│   │   │
│   │   ├── Financial Summary
│   │   │   Total committed | Invoiced | Paid | Retainage held | Outstanding
│   │   │   By project breakdown
│   │   │   Actions: [Make Payment] [View Payment History]
│   │   │
│   │   ├── Commitment History
│   │   │   All POs/subcontracts with this vendor
│   │   │   └── Click → Commitment detail (see Module 2)
│   │   │
│   │   ├── Lien Waiver Status
│   │   │   By project: conditional/unconditional status
│   │   │   Missing waivers highlighted
│   │   │   Actions: [Request Waiver] [Upload Received Waiver]
│   │   │
│   │   ├── Performance History
│   │   │   Projects worked on, COs generated, defects, schedule adherence
│   │   │   Actions: [Flag for Preferred List] [Flag Do Not Rehire] [Add Note]
│
├── Vendor Compliance Dashboard
│   Insurance expiring within 30/60/90 days
│   Missing W9s
│   Incomplete lien waiver chains
│   Actions: [Bulk Request Documents] [Export Compliance Report]
```

---

## Module 7: Team & Workforce

```
Workforce Operating View
├── Crew Allocation Matrix
│   Grid: Employee × Week → Project Assignment
│   │
│   ├── Click Employee → Employee Detail
│   │   ├── Current project assignment
│   │   ├── Rate, role, certifications
│   │   ├── Hours & cost allocation by project
│   │   ├── Utilization rate
│   │   Actions: [Reassign] [Adjust Rate] [Review Performance]
│   │
│   ├── Click Week Cell → Assignment Detail
│   │   Project, role, hours, cost
│   │   Actions: [Change Assignment] [Log Issue] [Update Hours]
│   │
│   ├── Click Project Column → Project labor detail
│   │   All employees assigned, hours, cost
│   │   Compare to labor budget
│   │   Actions: [Request More Crew] [Reduce Allocation]
│
├── Payroll View
│   ├── Calendar with upcoming pay dates
│   ├── Cost breakdown by employee and project
│   ├── YTD totals
│   Actions: [Preview Payroll] [Export to ADP/Gusto] [Adjust Allocation]
│
├── Capacity Planning
│   Which employees are available next week?
│   Which projects are understaffed?
│   Actions: [Auto-Suggest Allocation] [Flag Conflict]
```

---

## Drill Path Completeness Checklist

| Starting Point | Drill Depth | Reaches Source Records? | Has Action? |
|---------------|-------------|----------------------|-------------|
| Gross Margin KPI | 5 levels | Yes (cost events) | Yes (flag, CO, update forecast) |
| Cash on Hand KPI | 4 levels | Yes (bank transactions, invoices) | Yes (delay AP, accelerate draw) |
| AR KPI | 4 levels | Yes (invoices, payments) | Yes (remind, record payment, escalate) |
| Active Projects KPI | 5+ levels | Yes (full job cost chain) | Yes (flag, assign, review) |
| Pipeline KPI | 3 levels | Yes (opportunities, proposals) | Yes (update status, convert) |
| Debt KPI | 3 levels | Yes (loans, payments) | Yes (record payment, refinance) |
| Payroll KPI | 3 levels | Yes (employee records, allocations) | Yes (adjust, reallocate) |
| Retainage KPI | 3 levels | Yes (draw lines, vendor payments) | Yes (release, request waiver) |
| Job Cost (per project) | 6 levels | Yes (PO → invoice → payment → check#) | Yes (recode, void, flag, CO) |
| Cash Forecast | 4 levels | Yes (scheduled transactions) | Yes (adjust, delay, accelerate) |
| Change Orders | 4 levels | Yes (budget → billing → margin) | Yes (approve, reject, bill) |
| AR/Billing | 4 levels | Yes (invoice → draw → SOV line) | Yes (remind, collect, write off) |
| Vendor Management | 4 levels | Yes (commitments, invoices, payments) | Yes (pay, request docs, score) |
| Crew/Workforce | 3 levels | Yes (employee → allocation → cost) | Yes (reassign, adjust, flag) |

**Every path reaches source records. Every terminal node has at least one action.**
