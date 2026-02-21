# ROADMAP

## Delivery principle
Ship vertical slices that are production-usable, tenant-safe, and test-covered.

## Phase 0 — Foundation (in progress)
- Reuse-first baseline audit and gap analysis.
- Monorepo scaffold + standards placeholders.
- Core architecture/design docs initialized.

## Phase 1 — Core platform
### Sprint 1: Identity and tenancy
- Organizations, users, memberships, divisions.
- Login/logout/refresh rotation + profile.
- Invite flow and email verification.

### Sprint 2: RBAC and app shell
- Permission model + guard middleware.
- Protected routes and shell navigation.
- Session expiry/reauth UX.

### Sprint 3: Audit + controls baseline
- Audit events for material mutations.
- Approval policy framework (threshold capable).

## Phase 2 — Core domain MVP
### Sprint 4: Projects + cost codes
- Project list/detail with filterable financial summary.
- Cost code rollups with variance traces.

### Sprint 5: Budgets + change orders
- Budget versioning, revision history.
- CO submit/review/approve/reject workflow.

### Sprint 6: Commitments + AP invoices
- PO/subcontract commitments.
- AP invoices + lien waiver workflow.

### Sprint 7: AR draws + retainage
- SOV lines, pay apps, draw package generation.
- Retainage accrual/release tracking.

### Sprint 8: Documents + dashboard hardening
- Document versioning + role access controls.
- KPI drill-through to source transactions.

### Sprint 9: Vendors + CRM
- Vendor compliance and scorecards.
- Lead/proposal/pipeline with conversion insights.

## Phase 3 — Commercialization
### Sprint 10: Money movement (internal ops)
- AR payment requests and status tracking in-app.
- AP vendor payout workflow with approvals and audit events.
- Stripe webhooks for payment lifecycle reliability.

### Sprint 11: Integrations + notifications
- QuickBooks integration layer and sync jobs.
- Bank/credit-card feed connectors.
- Gusto sync baseline and email event templates.

## Phase 4 — Hardening
### Sprint 12+: Quality, performance, operations
- Full test matrix coverage.
- Security hardening and abuse protections.
- Backup/recovery runbook validation.
- Load/performance tuning on top 10 financial queries.
