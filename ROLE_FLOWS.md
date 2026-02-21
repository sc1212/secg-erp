# SECG ERP — Role-Based User Flows

**Date**: 2026-02-21
**Purpose**: Define explicit decision paths for each user role. Different roles see the same data through different lenses and need different actions.

---

## Role Definitions

| Role | Who | Primary Concern | Decision Frequency |
|------|-----|----------------|-------------------|
| **Owner/CEO** | Matt | Margin, cash, risk, growth | Daily (5-10 min), Weekly (30 min deep dive) |
| **CFO/Controller** | Finance lead | Cash management, AR/AP, compliance, reporting | Daily (active management) |
| **Project Manager** | PM per project | Budget, schedule, vendors, quality for their projects | Continuous throughout day |
| **Operations/Field** | Superintendent, foreman | Production, labor, material, schedule execution | Real-time |
| **Admin** | Office manager | Data entry, compliance tracking, document management | As needed |

---

## Flow 1: Owner/CEO Decision Paths

### Morning Check (5 minutes)

```
LOGIN
  │
  └── DASHBOARD (home page for Owner role)
      │
      ├── QUESTION: "Are we making money?"
      │   └── Gross Margin KPI
      │       ├── Green (>10%) → Scan alerts, move on
      │       └── Yellow/Red (<10% or declining)
      │           └── Click → Project Margin Ranking
      │               └── Worst projects at top
      │                   ├── Click worst project
      │                   │   └── Variance Analysis tab
      │                   │       └── Root cause waterfall
      │                   │           ├── Scope creep? → Review pending COs
      │                   │           ├── Price increase? → Check vendor contracts
      │                   │           ├── Rework? → Flag PM for review
      │                   │           └── Estimate miss? → Note for future bids
      │                   │
      │                   └── ACTION: [Flag for PM Review] [Schedule Meeting]
      │                              [Freeze Spending] [Update Forecast]
      │
      ├── QUESTION: "Will we have cash problems?"
      │   └── Cash on Hand KPI + 13-Week Forecast mini-chart
      │       ├── All green → Move on
      │       └── Any week shows negative or below threshold
      │           └── Click → 13-Week Cash Forecast
      │               └── Click red week
      │                   ├── What's causing the shortfall?
      │                   │   ├── AR delay → Click → Overdue invoices
      │                   │   │   └── ACTION: [Call client] [Send demand]
      │                   │   ├── AP concentration → Click → Payables due that week
      │                   │   │   └── ACTION: [Delay vendor payment] [Negotiate terms]
      │                   │   ├── Draw not submitted → Click → Draw queue
      │                   │   │   └── ACTION: [Submit draw ASAP] [Check lien waivers]
      │                   │   └── Payroll + debt → Click → Fixed obligations
      │                   │       └── ACTION: [Verify funding] [Move line of credit]
      │
      ├── QUESTION: "What needs my attention right now?"
      │   └── Alerts Panel
      │       ├── CRITICAL (red): Overdue AR, budget blow-out, cash crunch
      │       │   └── Click → Source module with pre-filtered view
      │       │       └── ACTION: [Assign] [Escalate] [Approve/Reject]
      │       ├── WARNING (yellow): Insurance expiring, lien waivers missing, COs pending
      │       │   └── Click → Detail view
      │       └── INFO (blue): Draw approved, payroll due, milestone completed
      │
      └── QUESTION: "How's the pipeline?"
          └── Pipeline Value KPI
              └── Click → Pipeline Funnel
                  ├── Enough future work? → Good
                  └── Pipeline thin?
                      └── ACTION: [Review bid opportunities]
                                 [Assign estimator] [Source new leads]
```

### Weekly Deep Dive (30 minutes)

```
OWNER WEEKLY REVIEW
  │
  ├── STEP 1: Portfolio Review
  │   Project List → Sort by Risk → Review top 5 riskiest
  │   For each:
  │     ├── Budget health? (variance column)
  │     ├── Schedule health? (days behind column)
  │     ├── Cash health? (draws remaining column)
  │     └── PM performing? (action items completed column)
  │
  ├── STEP 2: Financial Health
  │   Financials → P&L Summary
  │     ├── Revenue trend (up/down/flat)
  │     ├── Expense trend
  │     ├── Net margin by division
  │     └── Budget vs actual comparison
  │
  ├── STEP 3: Debt & Obligations
  │   Financials → Debt Schedule
  │     ├── Anything maturing soon?
  │     ├── Total debt service this month
  │     └── Construction loans vs budget remaining
  │
  ├── STEP 4: People & Capacity
  │   Team → Crew Allocation
  │     ├── Anyone underutilized?
  │     ├── Any project understaffed?
  │     └── Payroll trajectory
  │
  └── STEP 5: Pipeline & Growth
      CRM → Pipeline Summary
        ├── Win rate this quarter
        ├── Average deal size trend
        └── Opportunities needing decisions
```

---

## Flow 2: CFO/Controller Decision Paths

### Daily Cash Management

```
LOGIN
  │
  └── DASHBOARD → Focus on cash position and AR/AP
      │
      ├── TASK 1: Check Cash Position
      │   Cash on Hand KPI → Click
      │   └── Cash Position Breakdown
      │       ├── Bank balances current?
      │       ├── Any pending deposits?
      │       └── ACTION: [Record bank balance] [Flag discrepancy]
      │
      ├── TASK 2: Collections
      │   AR Outstanding KPI → Click
      │   └── AR Aging Table
      │       ├── Sort by: Age (oldest first)
      │       ├── Filter: 30+ days past due
      │       ├── For each overdue invoice:
      │       │   ├── When was last contact?
      │       │   ├── Any dispute?
      │       │   └── ACTION: [Send reminder] [Log call] [Escalate to Owner]
      │       └── ACTION: [Generate statements] [Auto-send reminders]
      │
      ├── TASK 3: Payables Management
      │   AP Outstanding KPI → Click
      │   └── Payables Queue
      │       ├── What's due this week?
      │       ├── Cash available to cover?
      │       ├── Lien waivers received?
      │       └── ACTION: [Approve payment] [Hold payment] [Request lien waiver]
      │
      ├── TASK 4: Draw Management
      │   Remaining Draws KPI → Click
      │   └── Open Draws Queue (all projects)
      │       ├── Which draws can be submitted?
      │       │   ├── Work completed → sufficient for draw?
      │       │   ├── Lien waivers current?
      │       │   ├── Inspection passed?
      │       │   └── ACTION: [Submit draw] [Request missing docs]
      │       ├── Which draws are pending approval?
      │       │   └── ACTION: [Follow up with lender] [Provide additional docs]
      │       └── Which draws were funded?
      │           └── ACTION: [Record deposit] [Reconcile]
      │
      └── TASK 5: Compliance Check
          Alerts → Filter by Compliance
          ├── Insurance expiring → ACTION: [Email vendor COI request]
          ├── W9 missing → ACTION: [Email vendor W9 request]
          ├── Lien waivers missing → ACTION: [Generate waiver requests]
          └── ACTION: [Generate compliance report]
```

### Weekly Reporting

```
CFO WEEKLY
  │
  ├── 13-Week Cash Forecast Review
  │   Compare to last week's forecast
  │   Update assumptions based on actual collections/payments
  │   Flag weeks that need intervention
  │
  ├── P&L Review
  │   By division: Construction, Multi-family, etc.
  │   Budget vs actual variance analysis
  │   Identify runaway expense categories
  │
  ├── WIP Schedule
  │   Over/under billing by project
  │   Revenue recognition accuracy
  │   Tax planning implications
  │
  └── Retainage Report
      What can we collect?
      What do we owe subs?
      Any projects near completion → retainage release planning
```

---

## Flow 3: Project Manager Decision Paths

### Daily Project Check

```
LOGIN
  │
  └── PROJECT LIST → Filter: "My Projects"
      │
      ├── For each active project:
      │
      ├── QUESTION: "Which cost codes are drifting?"
      │   └── Project → Cost Codes tab
      │       ├── Sort by: Variance (worst first)
      │       ├── Red flags: actual > 80% of budget with work remaining
      │       └── For each drifting code:
      │           ├── Why? → Click → Cost Events for this code
      │           │   ├── Unexpected invoice? → [Flag] [Contact vendor]
      │           │   ├── Extra work not covered by CO? → [Create CO]
      │           │   ├── Price higher than quoted? → [Compare to quote/bid]
      │           │   └── Rework? → [Tag as rework] [Back-charge if applicable]
      │           │
      │           └── ACTION: [Update EAC] [Request budget transfer]
      │                      [Create change order] [Flag for owner review]
      │
      ├── QUESTION: "What's committed but not invoiced?"
      │   └── Project → Commitments tab
      │       ├── Filter: Status = Executed, Remaining > 0
      │       ├── This is money we owe but haven't been billed for yet
      │       ├── Are vendors doing the work? → Check schedule
      │       └── ACTION: [Follow up with vendor] [Verify work complete]
      │                  [Cancel remaining if scope changed]
      │
      ├── QUESTION: "What change orders are pending?"
      │   └── Project → Change Orders tab
      │       ├── Filter: Status = Pending
      │       ├── How long have they been pending?
      │       ├── What's blocking approval?
      │       └── For each pending CO:
      │           ├── Need owner approval? → [Send to owner]
      │           ├── Need pricing? → [Get vendor quote]
      │           ├── Need documentation? → [Attach photos/docs]
      │           └── ACTION: [Approve] [Reject] [Escalate] [Update pricing]
      │
      ├── QUESTION: "What's the draw status?"
      │   └── Project → Pay Apps tab
      │       ├── Is there a draw in progress?
      │       ├── What work was completed since last draw?
      │       ├── Are lien waivers current?
      │       └── ACTION: [Create new draw] [Update % complete]
      │                  [Request lien waivers] [Submit to lender]
      │
      ├── QUESTION: "Is the schedule on track?"
      │   └── Project → Schedule tab
      │       ├── Milestones behind schedule → red flags
      │       ├── What's blocking progress?
      │       ├── Dependencies not met?
      │       └── ACTION: [Update milestone status] [Log delay reason]
      │                  [Reassign crew] [Escalate blocker]
      │
      └── QUESTION: "Are my vendors performing?"
          └── Project → Commitments → Click vendor
              ├── Score: quality, timeliness, communication, price
              ├── Any defects/callbacks?
              ├── Invoice accuracy?
              └── ACTION: [Update scores] [Add note] [Flag issue]
```

### Weekly PM Review

```
PM WEEKLY
  │
  ├── Variance Review (all my projects)
  │   For each project: budget health → focus on top 3 variance codes
  │   ACTION: [Update all EACs] [Send weekly report to owner]
  │
  ├── Draw Planning
  │   Which projects can draw this week?
  │   What's needed: lien waivers, inspection, documentation
  │   ACTION: [Prepare draw packages] [Schedule inspections]
  │
  ├── Vendor Management
  │   Outstanding POs without invoices → follow up
  │   Insurance expiring for my project vendors → request update
  │   Lien waiver gaps → request before next draw
  │
  └── Schedule Update
      Update all milestone statuses
      Flag delays with reasons
      Forecast completion dates
```

---

## Flow 4: Operations/Field Decision Paths

### Daily Field Operations

```
LOGIN (mobile-optimized view)
  │
  └── CREW ALLOCATION → This week's view
      │
      ├── QUESTION: "Who is working where today?"
      │   └── Crew Matrix → filter this week
      │       ├── My project assignments
      │       ├── Any conflicts? (same person on 2 projects)
      │       └── ACTION: [Log hours] [Request additional crew]
      │                  [Report absence] [Reassign]
      │
      ├── QUESTION: "What production items are blocked?"
      │   └── Project → Schedule tab → Filter: Status = Blocked
      │       ├── What's the blocker?
      │       │   ├── Material not delivered → [Contact supplier]
      │       │   ├── Inspection needed → [Schedule inspection]
      │       │   ├── Previous trade not finished → [Contact sub/PM]
      │       │   ├── Weather → [Log weather day]
      │       │   └── Owner decision needed → [Escalate to PM]
      │       └── ACTION: [Update status] [Log issue] [Escalate]
      │
      ├── QUESTION: "Any labor/sub/vendor issues?"
      │   └── Daily Log (activity log for today)
      │       ├── Subs on site: who showed up, who didn't
      │       ├── Material deliveries: received, damaged, missing
      │       ├── Safety issues
      │       ├── Quality issues
      │       └── ACTION: [Log daily report] [Flag issue] [Attach photo]
      │                  [Request material] [Report safety incident]
      │
      └── QUESTION: "What's scheduled for tomorrow?"
          └── Project → Schedule → Next 3 days
              ├── Trades arriving
              ├── Deliveries expected
              ├── Inspections scheduled
              └── ACTION: [Confirm with subs] [Prepare site]
```

---

## Flow 5: Admin Decision Paths

### Data Management

```
LOGIN
  │
  └── ADMIN PANEL
      │
      ├── TASK: Import New Data
      │   ├── Masterfile updated? → Upload new XLSX
      │   ├── Budget CSVs received? → Upload batch
      │   ├── BuilderTrend export? → Upload leads/proposals/jobs
      │   └── ACTION: [Import] → verify results → [Review errors]
      │
      ├── TASK: Compliance Tracking
      │   └── Vendor Compliance Dashboard
      │       ├── Insurance expiring within 30 days → [Send renewal request]
      │       ├── Missing W9s → [Send W9 request]
      │       ├── License expirations → [Alert PM]
      │       └── ACTION: [Bulk send requests] [Generate compliance report]
      │
      ├── TASK: User Management
      │   └── Users List
      │       ├── New employee needs access → [Create account + assign role]
      │       ├── Employee left → [Deactivate account]
      │       └── Role change → [Update permissions]
      │
      └── TASK: Data Quality
          └── System Status Page
              ├── Last import date/time
              ├── Record counts by table
              ├── Orphaned records
              ├── Data freshness warnings
              └── ACTION: [Re-import] [Clean up] [Export backup]
```

---

## Role-Based Home Page Configuration

Each role sees a different default view on login:

| Role | Home Page | Primary KPIs | Alert Priority |
|------|-----------|-------------|----------------|
| Owner/CEO | Executive Dashboard | Margin, Cash, Pipeline, Debt | Margin erosion, cash risk, large COs |
| CFO | Executive Dashboard (cash focus) | Cash, AR, AP, Retainage, Payroll | Overdue AR, cash shortfall, payroll due |
| PM | My Projects List | Project budget health, schedule, COs | Cost code overruns, pending COs, missing waivers |
| Ops/Field | Crew Allocation + Schedule | Today's crew, blocked items, daily log | Blocked tasks, missing materials, safety |
| Admin | Admin Panel | System status, import results | Data staleness, compliance gaps |

---

## Permission Matrix

| Action | Owner | CFO | PM | Ops | Admin |
|--------|-------|-----|-----|-----|-------|
| View all projects | Yes | Yes | Own only | Assigned only | Yes |
| Create project | Yes | No | No | No | Yes |
| Edit project budget | Yes | Yes | Yes (own) | No | No |
| Approve CO > $5K | Yes | Yes | No | No | No |
| Approve CO < $5K | Yes | Yes | Yes (own) | No | No |
| Submit draw | Yes | Yes | Yes (own) | No | No |
| Approve draw | Yes | Yes | No | No | No |
| Make payment > $10K | Yes | Yes | No | No | No |
| Make payment < $10K | Yes | Yes | Yes (own) | No | No |
| View financial data | Yes | Yes | Own project | No | No |
| Import data | Yes | No | No | No | Yes |
| Reset database | Yes | No | No | No | No |
| Manage users | Yes | No | No | No | Yes |
| Update vendor scores | Yes | Yes | Yes | No | No |
| Log daily activity | Yes | Yes | Yes | Yes | No |
| Update milestone | Yes | Yes | Yes (own) | Yes (assigned) | No |
| View payroll details | Yes | Yes | No | No | No |
| Export data | Yes | Yes | Yes (own) | No | Yes |

---

## Exception Handling by Role

### Owner gets escalated:
- Margin drops below 5% on any project
- Cash forecast shows negative in any week
- CO pending > 14 days without decision
- AR > 90 days overdue
- Vendor DNR flag needs confirmation

### CFO gets escalated:
- Cash shortfall within 2 weeks
- AP due exceeds cash available
- Draw rejection by lender
- Payroll funding issue
- Insurance lapse on active vendor

### PM gets notified:
- Cost code > 80% of budget
- New CO submitted by field
- Vendor invoice received
- Inspection result available
- Lien waiver received
- Schedule milestone status change

### Ops gets notified:
- Crew reassignment
- Material delivery scheduled
- Inspection scheduled
- Weather alert (if integrated)
- Safety incident report required
