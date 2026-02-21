# IMPLEMENTATION BACKLOG (Prioritized)

## P0 — Must ship first
1. Tenant-aware auth/session/RBAC/audit foundation.
2. Projects + budgets + cost code views with permission gates.
3. CO workflow with approvals and budget impact log.
4. AP invoices + retainage + waiver controls.
5. Executive dashboard drill-through integrity.

## P1 — High-value second wave
1. Draw workflow (AIA/SOV package lifecycle).
2. Document service with versioning and access policies.
3. Vendor scorecards and compliance tracker.
4. CRM pipeline and sold-project handoff.

## P2 — Integrations and money movement scale
1. QuickBooks sync service + mapping + reconciliation queue.
2. Bank/credit-card feed ingestion and normalization.
3. Stripe AR requests + vendor payout workflows (non-subscription first).
4. Email notifications and event templates.
5. Usage telemetry and operational dashboards.

## P3 — Commercialization
1. Subscription packaging + checkout + portal (later phase).
2. Tenant plan administration and billing analytics.

## P3 — Advanced intelligence
1. Predictive overrun engine.
2. Cash crunch radar scenarios.
3. Approval SLA optimization dashboards.
4. Anomaly detection feed.

## Definition of done checklist (each backlog item)
- Schema/migration updates (if required)
- API routes/services + boundary validation
- RBAC enforcement
- Frontend UI states (loading/error/empty/success)
- Audit logging for material changes
- Tests: integration + validation + permission (+ component where applicable)
- Documentation + QA runbook updates
