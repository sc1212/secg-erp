# Architecture Reset v2 — Why the previous output felt weak, and what changes now

## Direct answer
A fast React prompt can look "better" because it optimizes for **visual coherence** and quick screen composition. Our previous reset document optimized for **intent** but did not yet anchor that intent to this codebase's concrete routes, actions, and data contracts. This v2 package closes that gap with implementation-level drilldown contracts and build gates.

---

## 1) Current-state gap audit (in this repo)

### What exists
- Route shell and module pages exist (`/`, `/projects`, `/projects/:id`, `/financials`, `/payments`, `/vendors`, `/crm`, `/team`).
- Dashboard and financial views already render KPI cards, charts, and tables.

### What is missing vs operating-system depth
1. **KPI cards are display-only** (no required click-to-cause-to-record contract).
2. **Charts do not guarantee drill targets** (segment click behavior not defined as a system rule).
3. **Action closure path is absent** (flag/assign/approve/escalate/update forecast actions are not standardized end states).
4. **Role-based decision stacks are not encoded in navigation** (Owner/CFO, PM, Ops entry points are not explicit).
5. **Cross-module finance coupling rules are not executable** (CO ↔ budget ↔ billing ↔ AR ↔ cash forecast linkage not implemented as hard contract).

---

## 2) Non-negotiable architecture contracts (must be implemented before UI polish)

## 2.1 Drilldown contract (global)
Every top-level metric must implement:

`KPI -> Driver View -> Record List -> Source Transaction -> Action`

Required payload on every drill hop:
- `entity_type` (project, cost_code, invoice, payment, co, labor_entry)
- `entity_id`
- `time_window`
- `filters`
- `lineage_query_id`
- `role_context`

If any field is missing, the drill is invalid and should fail CI checks for drill-config completeness.

## 2.2 Action contract (global)
Every risk/variance endpoint must expose at least one completion action:
- `flag`
- `assign(owner_id, due_date)`
- `approve` (where governed)
- `escalate(level, reason)`
- `update_forecast(delta, rationale)`

No "read-only dead-end" pages are acceptable in core modules.

## 2.3 Root-cause taxonomy contract (job costing)
Variance records must include one of:
- `scope_change`
- `quantity_variance`
- `unit_price_variance`
- `rework`
- `productivity`
- `timing/cash_timing`
- `estimate_error`

Unclassified variance is blocked from executive rollups.

---

## 3) Module implementation blueprint (mapped to current product)

## 3.1 Executive dashboard (`/`)
Required KPI drill chains:
- Gross Margin % -> margin drivers -> project delta rank -> cost code variance -> source transactions -> action.
- 13-week cash shortfall -> week bucket drivers -> AR/AP/payroll/debt records -> transaction -> action.
- AR aging/retainage -> bucket -> customer/project -> invoice/draw -> collections timeline -> action.

Build gate:
- 100% of KPI cards and chart segments have drill target configuration and action endpoints.

## 3.2 Projects + Project Detail (`/projects`, `/projects/:id`)
Required chain:
- Project -> phase/division -> cost code -> budget/commitment/invoice/payment/EAC -> root cause -> vendor/sub/labor source -> action.

Build gate:
- At least one complete project can be walked end-to-end with transaction evidence and audit trail.

## 3.3 Financials (`/financials`)
Required chains:
- Cash forecast -> week -> driver -> transaction.
- AR -> aging bucket -> invoice -> draw/retainage docs -> collection action.
- Debt obligations -> schedule -> payment events -> forecast effect.

Build gate:
- Week-level shortfall explanation reconciles to underlying transactions.

## 3.4 Payments + Vendors (`/payments`, `/vendors`)
Required chain:
- Vendor/Sub -> PO/Subcontract -> invoice -> payment -> job cost impact -> variance impact.

Build gate:
- Payment status always traceable to originating commitment and cost code.

## 3.5 Change Orders (new module or integrated flow)
Required chain:
- CO log -> status -> CO detail -> budget revision -> billing state -> AR/cash effect -> margin effect.

Build gate:
- Approved CO changes budget + forecast + billing state in one workflow transaction.

---

## 4) Role-first operating flows (must drive nav and defaults)

- **Owner/CFO workspace:** margin-at-risk, cash-at-risk (2–13 week), intervention queue.
- **PM workspace:** cost code drift, commitments not invoiced, pending CO blockers, EAC actions.
- **Ops workspace:** production blockers, labor/sub/vendor constraints, escalation queue.

Navigation rule:
- Users land in their role workspace by default; cross-role pages are opt-in pivots, not default starting points.

---

## 5) Acceptance criteria (scored, testable)
A reset is accepted only if all pass:
1. Every top KPI has an executable drill config ending in a source transaction.
2. Job cost chain supports project -> phase -> cost code -> vendor/sub -> PO/invoice -> payment.
3. Variance views require root-cause tags and prevent unclassified rollup.
4. CO approval updates budget, forecast, billing, margin in linked workflow.
5. AR/retainage visible by project and drillable to invoice/draw record.
6. Drilldowns end in action controls, not read-only dead ends.
7. Owner/CFO, PM, Ops have distinct default workspaces and decision stacks.
8. Cash forecast shortfall weeks reconcile to transaction-level drivers.

---

## 6) 2-sprint recovery plan (logic first)

### Sprint A — Contracts + traceability
- Define drilldown registry for all core KPIs/charts.
- Add lineage IDs and role context to drill payloads.
- Implement action API shape and audit log model.
- Add variance taxonomy enforcement.

Exit criteria:
- A scripted test can validate that each KPI/chart has a drill target and action endpoint.

### Sprint B — End-to-end chains in core flows
- Implement complete chain for Gross Margin erosion.
- Implement complete chain for 13-week cash risk.
- Implement complete chain for pending CO financial impact.

Exit criteria:
- Three canonical scenarios run end-to-end from KPI to transaction to action with persisted audit history.

---

## 7) Definition of "UI-ready" (strict)
A page is UI-ready only when:
1. Decision intent is documented.
2. Drill path is executable.
3. Source transactions are reachable.
4. At least one closure action is available.
5. Role ownership and SLA are assigned.

If any condition fails, no visual redesign pass should proceed.
