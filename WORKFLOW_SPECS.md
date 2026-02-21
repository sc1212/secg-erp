# SECG ERP — Page-by-Page Workflow Specifications

**Date**: 2026-02-21
**Purpose**: Define every page/module in terms of users, decisions, inputs, outputs, actions, drilldowns, and edge cases. No page exists without a clear operational purpose.

---

## Page 1: Executive Dashboard

### Primary Users
- **Owner/CEO** (Matt) — daily morning review
- **CFO/Controller** — cash management, risk monitoring

### Primary Decisions This Page Supports
1. "Is the company making money?" (margin trend)
2. "Will we have cash problems in the next 13 weeks?" (cash forecast)
3. "Which projects/vendors/PMs need immediate attention?" (alerts)
4. "Are we collecting what we're owed?" (AR aging)
5. "How is our pipeline for future work?" (pipeline health)

### Required Inputs
- No user input required — page is read-only with drill capabilities
- Data feeds from: all active projects, invoices, debts, payroll, pipeline, retainage

### Outputs Generated
- 8 KPI cards (each drillable)
- 2 operational charts (budget vs actuals, cash forecast)
- Alert queue with prioritized action items
- One-click access to any problem area

### Drilldown Destinations
| Element | Drills To |
|---------|-----------|
| Cash on Hand | Cash position breakdown → bank accounts → transactions |
| AR Outstanding | AR aging table → invoice → payment history |
| AP Outstanding | Payables queue → vendor → invoice |
| Active Projects | Project list (filtered active) → project detail |
| Gross Margin % | Project margin ranking → cost code variance |
| Pipeline Value | Pipeline funnel → opportunity detail |
| Total Debt | Debt schedule → loan detail → payment history |
| Payroll | Payroll calendar → pay period detail → employee |
| Retainage | Retainage table → project/vendor → release flow |
| Chart segment | Filtered data for that segment |
| Alert item | Source module for that alert |

### Actions Available
| Action | Trigger | Effect |
|--------|---------|--------|
| Flag for Review | Click alert → Flag | Creates workflow task assigned to PM/CFO |
| Dismiss Alert | Click alert → Dismiss | Removes from queue (logged) |
| Quick Navigate | Click any KPI | Drills to detail module |
| Refresh Data | Pull to refresh / button | Reloads all KPIs |
| Export Summary | Button | Generates executive summary PDF |
| Set Alert Thresholds | Settings gear | Configure warning/critical levels |

### Edge Cases
- **No data imported yet**: Show onboarding prompt ("Import your masterfile to get started")
- **All projects completed**: Show "No active projects" with link to pipeline
- **Cash forecast shows negative**: Highlight in red, auto-generate critical alert
- **Stale data (>24h)**: Show "Last updated" timestamp with warning badge

---

## Page 2: Project List

### Primary Users
- **Owner/CEO** — portfolio overview
- **PM** — my projects view
- **CFO** — financial health by project

### Primary Decisions
1. "Which of my projects need attention?" (risk ranking)
2. "Which projects are over budget?" (variance filter)
3. "Which projects are behind schedule?" (schedule status)
4. "What's the overall portfolio health?" (summary stats)

### Required Inputs
- Filter selections: Status, Type, PM, Risk Level, Date Range
- Search query (project name/code)
- Sort selection

### Outputs
- Filterable, sortable project table
- Summary statistics bar (total budget, total spent, avg margin, at-risk count)
- Quick-action buttons per row

### Drilldown Destinations
| Element | Drills To |
|---------|-----------|
| Project row | Project Operating View (Module 2) |
| PM name | PM performance dashboard |
| Risk flag | Risk detail modal |
| Status badge | Filtered list by status |
| Budget column | Sorted by budget variance |

### Actions
| Action | Who | Effect |
|--------|-----|--------|
| Create Project | Admin/PM | Opens project creation form |
| Change Status | PM/Admin | Status transition (with confirmation) |
| Assign PM | Owner/Admin | Reassign project manager |
| Archive Project | Admin | Move to archived (requires closeout checklist) |
| Export List | Any | CSV/PDF export |
| Filter by "My Projects" | PM | Filter to projects where current user = PM |
| Bulk Status Change | Admin | Change status of multiple selected projects |

### Edge Cases
- **PM has no projects**: Show "No projects assigned" with link to pipeline
- **Project has no cost codes**: Flag as "Needs Setup" in status column
- **Project is over 100% of budget**: Red flag, escalation alert auto-generated
- **Filter returns 0 results**: "No projects match filters" with reset button

---

## Page 3: Project Operating View (Detail)

This is the most complex page — the core of the system.

### Primary Users
- **PM** — daily project management
- **Owner/CEO** — project oversight
- **CFO** — project financial review

### Primary Decisions
1. "Is this project on budget?" (cost code variance table)
2. "Is this project on schedule?" (milestone tracker)
3. "What's the forecasted margin?" (EAC vs contract)
4. "What needs to be billed?" (unbilled work)
5. "What change orders are pending?" (CO queue)
6. "Are we exposed on lien waivers?" (waiver status)
7. "What vendors are at risk?" (commitment status)

### Sub-Tabs and Their Specs

#### Tab 3.1: Overview
- **Inputs**: None (read-only)
- **Outputs**: Project header, key metrics, health indicators, timeline chart
- **Decisions**: "Is this project healthy or does it need intervention?"
- **Actions**: [Edit Project Details] [Change Status] [Add Note] [Assign Superintendent]

#### Tab 3.2: Cost Codes / Budget
- **Inputs**: Cost code filters (category, variance threshold)
- **Outputs**: Full cost code table with budget/committed/actual/EAC/variance
- **Decisions**: "Which cost codes are bleeding?" "Where is uncommitted budget at risk?"
- **Actions**: [Add Cost Code] [Edit Budget] [Transfer Budget Between Codes] [Request CO] [Update EAC] [Lock Budget]
- **Drill**: Click cost code → transaction list, commitment list, variance waterfall

#### Tab 3.3: Commitments / POs
- **Inputs**: Commitment filters (vendor, status, type)
- **Outputs**: All purchase orders and subcontracts
- **Decisions**: "What's committed vs budget?" "Which POs are approaching their limit?" "Who hasn't been locked in?"
- **Actions**: [Create PO] [Create Subcontract] [Issue CO to Commitment] [Record Invoice Against PO] [Close Out Commitment]
- **Drill**: Click commitment → line items, invoices, payments, lien waivers

#### Tab 3.4: Schedule of Values (SOV)
- **Inputs**: None (read-only unless creating draw)
- **Outputs**: AIA G703 format table
- **Decisions**: "What can we bill this period?" "Are we over/under billing?"
- **Actions**: [Create Pay Application] [Adjust % Complete] [Generate G702/G703 PDF] [Add SOV Line] [Split Line]
- **Drill**: Click line → billing history, cost code link, over/under billing analysis

#### Tab 3.5: Pay Applications / Draws
- **Inputs**: Draw creation form (period, amounts per SOV line)
- **Outputs**: Draw history table, current draft
- **Decisions**: "What's the status of our draws?" "How much retainage is held?" "What's left to draw?"
- **Actions**: [Create New Draw] [Edit Draft] [Submit for Lender Approval] [Mark as Funded] [Generate PDF]
- **Drill**: Click draw → line items, lien waiver status, approval history, cash impact

#### Tab 3.6: Change Orders
- **Inputs**: CO creation form (scope, amount, cost codes affected)
- **Outputs**: CO log with status, amounts, budget/billing/margin impact
- **Decisions**: "What's pending?" "What's the net budget impact?" "Which COs need to be billed?"
- **Actions**: [Create CO] [Approve/Reject] [Submit to Owner] [Add to SOV] [Update Budget] [Include in Next Draw]
- **Drill**: Click CO → budget impact chain, billing status, margin effect

#### Tab 3.7: Schedule / Milestones
- **Inputs**: Milestone status updates
- **Outputs**: Gantt-style timeline, milestone table
- **Decisions**: "What's behind schedule?" "What's blocking the next phase?" "What's the critical path?"
- **Actions**: [Add Milestone] [Update Status] [Log Delay Reason] [Reassign] [Set Dependency]
- **Drill**: Click milestone → task detail, assigned crew, related cost codes

#### Tab 3.8: Variance Analysis
- **Inputs**: Variance type filters, date range
- **Outputs**: Variance waterfall chart, root cause table
- **Decisions**: "Why is this project over/under budget?" "What are the root causes?"
- **Actions**: [Tag Root Cause] [Create CO from Variance] [Back-Charge Vendor] [Update Forecast] [Generate Variance Report]
- **Drill**: Click waterfall segment → transactions, click root cause → source records

#### Tab 3.9: Cash Flow (Project-Level)
- **Inputs**: Date range
- **Outputs**: Project-level cash inflows vs outflows over time
- **Decisions**: "When will this project need funding?" "Is the draw schedule aligned with costs?"
- **Actions**: [Request Draw] [Delay Payment to Sub] [Adjust Forecast]

#### Tab 3.10: Documents
- **Inputs**: File uploads
- **Outputs**: Document library organized by type (contracts, permits, insurance, photos, drawings)
- **Actions**: [Upload] [Version] [Link to Entity] [Download] [Share]

#### Tab 3.11: Activity Log
- **Inputs**: None (auto-generated)
- **Outputs**: Chronological log of all changes, approvals, comments
- **Decisions**: "What changed?" "Who made the last update?" "What's the approval history?"
- **Actions**: [Add Note] [Filter by Type] [Export Log]

---

## Page 4: Financials Hub

### Primary Users
- **CFO/Controller** — primary user
- **Owner/CEO** — oversight

### Sub-Tabs

#### Tab 4.1: Debt Schedule
- **Decisions**: "What do we owe?" "What's maturing soon?" "What's the total debt service?"
- **Outputs**: Debt table grouped by type, totals, maturity timeline
- **Actions**: [Add Debt] [Record Payment] [Update Balance] [Refinance Analysis] [Export]
- **Drill**: Click debt → payment history, linked project, amortization

#### Tab 4.2: P&L
- **Decisions**: "Are we profitable?" "Which division is performing?" "How does actual compare to budget?"
- **Outputs**: P&L statement by period, division comparison, budget vs actual
- **Actions**: [Filter by Division] [Compare Periods] [Export] [Drill to Transactions]
- **Drill**: Click account → transaction list for that account/period

#### Tab 4.3: AR / Collections
- **Decisions**: "Who owes us money?" "What's past due?" "What's our DSO?"
- **Outputs**: Aging table, collection queue, DSO trend
- **Actions**: [Send Reminder] [Record Payment] [Create Invoice] [Write Off] [Flag Dispute] [Generate Statement]
- **Drill**: Click invoice → full detail with source project/draw

#### Tab 4.4: Cash Forecast (13-Week)
- **Decisions**: "Will we have a cash shortfall?" "When?" "What can we do about it?"
- **Outputs**: 13-week grid, trend chart, risk flags
- **Actions**: [Adjust Forecast] [Delay Payment] [Accelerate Collection] [Run Scenario]
- **Drill**: Click week → inflow/outflow breakdown → transaction level

#### Tab 4.5: Retainage
- **Decisions**: "How much retainage can we collect?" "What do we owe subs in retainage?"
- **Outputs**: Retainage table (receivable + payable), totals by project
- **Actions**: [Request Release] [Release to Sub] [Link to Lien Waiver]
- **Drill**: Click entry → project draw detail or vendor payment detail

#### Tab 4.6: Recurring Expenses
- **Decisions**: "What's our fixed overhead?" "What's coming due?"
- **Outputs**: Recurring expense list with totals by frequency
- **Actions**: [Add Expense] [Pause] [Cancel] [Update Amount]

#### Tab 4.7: Properties / Portfolio
- **Decisions**: "What's our real estate equity?" "Which properties should we exit?"
- **Outputs**: Property table with values, LTV, equity, exit strategy
- **Actions**: [Update Value] [Change Strategy] [Link to Project]

#### Tab 4.8: Transaction Log
- **Decisions**: "What transactions hit this period?" "Can I find a specific payment/invoice?"
- **Outputs**: Paginated, filterable transaction list (all cost events)
- **Actions**: [Filter] [Search] [Export] [Recode] [Void]
- **Drill**: Click transaction → full detail with vendor, project, cost code, source

---

## Page 5: CRM / Pipeline

### Primary Users
- **Owner/CEO** — pipeline health, revenue forecasting
- **Sales/Estimating** — lead management, proposal tracking

### Sub-Tabs

#### Tab 5.1: Leads
- **Decisions**: "Which leads should I follow up with?" "What's my conversion rate?" "Which sources produce the best leads?"
- **Outputs**: Lead table with status, value, source, salesperson, last contacted
- **Actions**: [Add Lead] [Update Status] [Assign Salesperson] [Create Proposal] [Convert to Project] [Mark Lost + Reason]
- **Drill**: Click lead → full detail with contact info, proposals, timeline, notes

#### Tab 5.2: Proposals
- **Decisions**: "What proposals are outstanding?" "What's our proposal-to-close rate?" "Which proposals need follow-up?"
- **Outputs**: Proposal table with amounts, status, dates
- **Actions**: [Create Proposal] [Send] [Mark Viewed/Approved/Rejected] [Clone as Template]
- **Drill**: Click proposal → linked lead, scope, pricing, revision history

#### Tab 5.3: Bid Pipeline
- **Decisions**: "What's our weighted pipeline?" "What bids are due soon?" "Which opportunities should we pursue?"
- **Outputs**: Pipeline funnel chart, opportunity table, weighted value
- **Actions**: [Add Opportunity] [Update Status/Probability] [Assign Estimator] [Submit Bid] [Mark Won/Lost]
- **Drill**: Click opportunity → full detail, click funnel stage → filtered list

---

## Page 6: Vendor Management

### Primary Users
- **PM** — vendor selection, performance tracking
- **CFO** — compliance, payment management
- **Owner** — vendor relationship oversight

### Decisions
1. "Which vendor should I use for this scope?" (scorecard comparison)
2. "Are all vendors compliant?" (insurance, W9, license)
3. "Which vendors have outstanding lien waiver requirements?"
4. "How much do we owe each vendor?"

### Outputs
- Vendor table with trade, scores, compliance status
- Compliance dashboard (insurance expiring, missing W9s, lien waiver gaps)
- Vendor financial summary

### Actions
| Action | Who | Effect |
|--------|-----|--------|
| Add Vendor | Any | Create vendor record |
| Update Scores | PM | Set quality/timeliness/communication/price scores |
| Request Insurance | Admin | Email vendor for updated COI |
| Request Lien Waiver | PM/Admin | Send lien waiver request linked to draw |
| Make Payment | CFO | Record payment, link to commitment/invoice |
| Flag Do Not Rehire | PM/Owner | Mark vendor with DNR flag + reason |
| Compare Vendors | PM | Side-by-side scorecard comparison for same trade |

### Drill Paths
| Element | Drills To |
|---------|-----------|
| Vendor row | Vendor detail (financial, compliance, performance) |
| Score column | Score history over time |
| Compliance flag | Specific missing document |
| Outstanding amount | Invoice/payment detail |
| Project column | Commitments for this vendor on that project |

---

## Page 7: Team / Workforce

### Primary Users
- **Owner/CEO** — labor cost oversight
- **Ops Manager** — crew deployment
- **PM** — "who's on my job?"

### Decisions
1. "Who is working where this week?" (crew matrix)
2. "Is payroll going to hit cash flow?" (payroll forecast)
3. "Who is available for the next project?" (capacity)
4. "Are labor costs per project on budget?" (cost allocation)

### Actions
| Action | Who | Effect |
|--------|-----|--------|
| Assign Crew | Ops/PM | Deploy employee to project for a week |
| Adjust Hours | Ops | Change allocated hours |
| Add Employee | Admin | Create employee record |
| Deactivate Employee | Admin | Mark as inactive |
| Update Rate | Owner/Admin | Change hourly rate or salary |
| View Utilization | Owner | See utilization % by employee |
| Export Payroll | CFO | Generate payroll export for ADP/Gusto |

---

## Page 8: Payments Hub

### Primary Users
- **CFO/Controller** — payment execution
- **Owner** — payment approval

### Sub-Tabs

#### Tab 8.1: Pay a Vendor
- **Inputs**: Select vendor, select invoices/commitments to pay, payment method, amount
- **Validations**:
  - Lien waiver received? (warn if missing)
  - Budget available in cost code? (warn if over)
  - Retainage calculation correct?
  - Duplicate payment check
- **Outputs**: Payment record, updated vendor balance, updated commitment status
- **Actions**: [Submit Payment] [Approve Payment] [Hold Payment] [Schedule Future Payment]
- **Workflow**: Draft → Submitted → Approved (if >$X) → Processed → Confirmed

#### Tab 8.2: Request a Draw
- **Inputs**: Select project, select SOV lines, enter amounts/percentages
- **Validations**:
  - % complete reasonable? (flag >10% jump)
  - Lien waivers current for all subs?
  - Supporting documentation attached?
  - Retainage calculated correctly?
- **Outputs**: Draw request (pay app), G702/G703 PDFs, lien waiver checklist
- **Actions**: [Create Draw] [Submit to Lender] [Print G702/G703] [Check Lien Waiver Status]
- **Workflow**: Draft → Reviewed → Submitted to Lender → Approved → Funded

#### Tab 8.3: Payment History
- **Outputs**: All payments made, filterable by vendor/project/date/method
- **Actions**: [Export] [Void Payment] [View Check Image] [Reconcile]
- **Drill**: Click payment → full detail with linked invoice, commitment, project, cost code

---

## Page 9: Admin / Settings

### Primary Users
- **Admin** — system configuration
- **Owner** — import data, manage users

### Functions
1. **Import Data**: Upload masterfile, budget CSVs, BuilderTrend exports
2. **Database Status**: Row counts, last import time, data freshness
3. **User Management**: Add/deactivate users, assign roles
4. **System Settings**: Company info, default retainage %, payment thresholds
5. **Audit Log**: View all system changes with who/when/what

### Actions
| Action | Who | Effect |
|--------|-----|--------|
| Import Masterfile | Admin | Upload and process XLSX |
| Import Budgets | Admin | Upload and process budget CSVs |
| Import Leads | Admin | Upload BuilderTrend leads |
| Reset Database | Super Admin (with MFA) | Nuclear option — requires 2FA confirmation |
| Manage Users | Admin | CRUD on user accounts + role assignment |
| View Audit Log | Admin/Owner | See all changes across the system |
| Export All Data | Admin | Full database export for backup |

---

## Cross-Page Navigation Rules

### From any record detail, you can navigate to:
- The **parent** record (cost code → project, invoice → project, commitment → project)
- **Related** records (vendor → their commitments, project → its vendors)
- **Source** data (cost event → import batch, budget → original masterfile tab)
- **Downstream** impacts (CO → budget revision → billing change → margin change)

### Breadcrumb Pattern
Every detail view shows a breadcrumb trail:
```
Dashboard → Projects → WG1: Walnut Grove Lot 1 → Cost Codes → 003: Lumber & Framing → PO #1042 → Invoice #8391
```
Each breadcrumb segment is clickable, navigating back up the hierarchy.

### Context Preservation
When drilling down:
- Filters from the parent view are preserved (if applicable)
- Back button returns to the exact scroll position and filter state
- "Open in new tab" supported for comparison workflows
