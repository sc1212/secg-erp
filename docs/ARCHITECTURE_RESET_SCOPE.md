# Architecture Reset Scope — System Logic First

## Purpose
Realign the product to operate as a construction company operating system (finance + project execution), not a UI-first dashboard. This reset defines the workflow depth, drilldown chains, data traceability, and role-based decision paths that must be approved before additional UI iteration.

## Team / Ownership Transition Plan
Because this reset requires deeper ERP and construction-finance systems thinking, delivery should be led by a **Product/UX Systems Lead** with domain depth in job costing, cash management, and enterprise information architecture.

### Recommended ownership model
- **Executive Sponsor (Client-side):** final acceptance on workflow depth and module readiness.
- **Product/UX Systems Lead (New):** owns drilldown architecture, decision-path UX, and workflow specs.
- **Finance Systems Architect:** owns accounting and traceability rules across AR/AP/CO/job cost/cash forecast.
- **Construction Operations SME:** validates PM and field-operational logic.
- **Implementation Lead:** translates approved architecture into incremental build plans.

### Reassignment checkpoint
- Reassignment is considered complete when the new Product/UX Systems Lead publishes and presents this full reset package and receives sponsor sign-off.

---

## 1) Drilldown Architecture Map (Required)

### 1.1 Executive Dashboard KPI drill paths
| KPI | Drill path |
|---|---|
| Gross Margin % | KPI → Margin driver category (labor/material/subcontract/CO slippage) → project rank by delta → phase/division → cost code → source records (PO, invoice, payroll entry, CO, payment) |
| Cash Position / 13-week Cash | KPI → week bucket → inflow/outflow drivers → AR/AP/payroll/debt sub-ledger → project/customer/vendor records → source transactions |
| AR Aging | KPI → aging bucket → customer/project → invoice/draw/retainage line → collections activity and supporting docs |
| Over-budget Jobs | KPI → flagged projects → phase/division → cost code variance (budget/commitments/invoiced/paid/EAC) → root-cause tags → transaction history |
| Pending Change Orders | KPI → CO status bucket → project CO log → CO detail (amount, status, dates, approvals) → budget revision + billing linkage + margin effect |
| PM Risk Score | KPI → PM portfolio heatmap → project risk contributors (schedule/cost/cash/quality) → cost code and workflow exceptions → source evidence |

### 1.2 Job Costing drill path
Project → Phase/Division → Cost Code → Budget / Commitments / Invoiced / Paid / EAC → Variance Root Cause (scope/quantity/price/rework/productivity) → Vendor/Sub/Labor entries → PO/Invoice/Timesheet/Payment source records.

### 1.3 Cash Flow drill path
13-week Forecast → Week bucket → Driver type (AR delay, AP due, payroll spike, debt service, capex) → underlying invoices/bills/payroll batches/draw schedule → source transaction + approval/owner.

### 1.4 AR / Billing / Retainage drill path
AR Summary → Aging bucket + retainage state → Customer → Project → Draw/Invoice line → supporting documents (SOV, lien waivers, certs) → collection action log.

### 1.5 Change Orders drill path
CO log → Status (draft/submitted/approved/rejected/billed) → Project CO detail → Budget revision impact → Forecast and margin impact → Billing status and AR consequence.

---

## 2) Page-by-Page Workflow Spec (Required)

## 2.1 Executive Command Center
- **Primary users:** Owner, CFO.
- **Decisions supported:** margin protection, liquidity intervention, portfolio escalation.
- **Inputs:** KPI definitions, forecasting assumptions, project health feeds.
- **Outputs:** intervention queue, forecast adjustments, executive escalation list.
- **Drilldown destinations:** margin variance page, cash risk page, AR collections page, CO risk page.
- **Actions:** flag risk, assign owner, request forecast update, approve escalation.
- **Exceptions:** missing project data, stale integrations, conflicting forecast versions.

## 2.2 Job Costing Control Center
- **Primary users:** PM, Project Accountant, Ops Lead.
- **Decisions supported:** reforecasting, cost containment, commitment approval.
- **Inputs:** estimate baseline, budget revisions, commitments, invoices, labor actuals.
- **Outputs:** EAC updates, variance narratives, mitigation actions.
- **Drilldown destinations:** cost code ledger, vendor/sub performance, labor productivity detail.
- **Actions:** adjust forecast, open issue, assign corrective action, hold/approve commitment.
- **Exceptions:** uncoded costs, orphaned commitments, duplicate vendor bills.

## 2.3 Cash Flow Workbench (13-week)
- **Primary users:** Owner, CFO, Controller.
- **Decisions supported:** near-term liquidity planning, payment prioritization, collections urgency.
- **Inputs:** AR expected dates, AP due schedule, payroll calendar, debt schedule.
- **Outputs:** weekly shortfall map, mitigation plan, payment/collection priorities.
- **Drilldown destinations:** AR invoice detail, AP bill queue, payroll batches, debt obligations.
- **Actions:** shift payment date, escalate collection, adjust assumption, trigger contingency.
- **Exceptions:** disputed invoices, holdbacks, covenant-trigger events.

## 2.4 AR / Billing / Retainage
- **Primary users:** Billing team, Controller, CFO.
- **Decisions supported:** billing acceleration, collections sequencing, retainage release readiness.
- **Inputs:** draw packages, invoice status, retainage schedule, customer response notes.
- **Outputs:** collections worklist, delayed-cash risk, retainage release queue.
- **Drilldown destinations:** invoice-level timeline, project billing status, customer correspondence.
- **Actions:** assign collector, issue notice, update expected cash date, mark dispute.
- **Exceptions:** partial approvals, rejected draws, retainage conditions unmet.

## 2.5 Change Order Control
- **Primary users:** PM, Operations, Finance.
- **Decisions supported:** CO approval priority, financial impact, billing timing.
- **Inputs:** CO amount, scope justification, owner response, cost/time effect.
- **Outputs:** approved CO pipeline, budget delta, margin forecast adjustments.
- **Drilldown destinations:** project budget revisions, billing queue, margin impact report.
- **Actions:** approve/reject/escalate CO, request revision, mark billable readiness.
- **Exceptions:** owner non-response, scope mismatch, missing backup documentation.

---

## 3) Role-Based User Flows (Required)

## 3.1 Owner/CFO Flow
1. Open Executive Command Center.
2. Identify top margin and cash risks.
3. Drill from KPI to drivers to project/cost-code evidence.
4. Compare forecast versions and intervention options.
5. Assign accountable owner and due date.
6. Track closure and impact on margin/cash.

## 3.2 PM Flow
1. Open project health and job cost variance view.
2. Drill to cost code drift and commitments not yet invoiced.
3. Evaluate pending CO blockers and billing readiness.
4. Update EAC and mitigation actions.
5. Submit escalation for unresolved scope/price/rework drivers.

## 3.3 Ops/Field Flow
1. Open production blockers dashboard.
2. Identify labor/sub/vendor constraints causing schedule or cost slippage.
3. Drill to daily reports, labor entries, vendor incidents.
4. Trigger assignment/escalation to PM/Ops lead.
5. Confirm resolution and update project status.

---

## 4) Data Relationship / Traceability Rules (Required)

## 4.1 Core relationship chains
- Project ↔ Phase/Division ↔ Cost Code.
- Vendor/Sub ↔ Commitment (PO/Subcontract) ↔ Invoice ↔ Payment.
- Change Order ↔ Budget Revision ↔ Forecast Update ↔ Billing Record ↔ Margin Delta.
- AR Invoice/Draw ↔ Collection Activity ↔ Forecasted Cash Inflow.
- Payroll/Labor Entry ↔ Job Cost ↔ Productivity Metric ↔ Variance classification.

## 4.2 Traceability standards
- Every financial record must carry project, phase/division, and cost code context where applicable.
- Every aggregate metric must store query lineage (filters, period, source tables).
- Every forecast change must retain version history (who changed what and why).
- Every escalation/action must link back to originating KPI/variance record.

---

## 5) Interaction Standards (Required)
- Every top-level KPI is clickable.
- Every chart segment opens a filtered operational view.
- Every filtered view supports: **sort, filter, compare, export** (as applicable).
- Every risk/variance view supports action controls: **flag, assign, approve, escalate, update forecast**.
- Breadcrumbs must preserve drill context from KPI → record → source transaction.
- Users can pivot from summary to exception queue without losing filters.

---

## 6) Acceptance Criteria (Must pass before new UI pass)

1. Every top-level KPI has drill path to source records.
2. Job costing supports full chain: project → phase → cost code → vendor/sub → PO/invoice/payment.
3. Variance views include root-cause taxonomy (scope, quantity, price, rework, productivity, timing).
4. Approved COs update budget, forecast, margin, and billing state.
5. AR and retainage are project-visible and invoice-level drillable.
6. Drilldowns end in actionable controls (flag/assign/approve/escalate/update forecast).
7. Role-based decision stacks exist for Owner/CFO, PM, and Ops.
8. Cash forecast explains week-level driver composition and transaction lineage.
9. No page is approved if it presents KPIs without decision path and transaction traceability.

---

## 7) Revised Implementation Plan (Logic first, UI second)

### Phase 0 — Architecture Reset (current)
- Finalize drilldown map, role flows, page specs, data relationship rules.
- Publish glossary + metric definitions + variance taxonomy.
- Gate: sponsor sign-off of this document.

### Phase 1 — Data and workflow backbone
- Implement canonical entities and relationship keys.
- Implement traceability events and action model (assign/escalate/approve).
- Implement forecast versioning and audit timeline.
- Gate: KPI lineage and cross-module linkage verified.

### Phase 2 — Operational workflow surfaces
- Build module views around approved decision paths.
- Prioritize executive margin/cash drilldowns, then PM job cost workflows, then Ops blockers.
- Gate: each page demonstrates problem → drilldown → action chain.

### Phase 3 — UI refinement and optimization
- Apply visual polish after architecture validation.
- Introduce advanced comparisons and saved role-based workspaces.
- Gate: usability and speed optimizations only after operational completeness.

## Definition of “UI-ready” moving forward
A page is UI-ready only when its decision logic, drilldowns, and traceability chain are approved in architecture review.
