# GAP ANALYSIS

## Required vs current

## Phase 0 Foundation
- Monorepo scaffold: **Started** (workspace placeholders).
- TS strict/lint/format/husky/lint-staged: **Missing**.
- CI skeleton: **Missing**.
- Core docs baseline: **Started**.

## Phase 1 Core platform
- Organizations/tenants/users/memberships: **Missing**.
- Auth (signup/login/me baseline): **In progress**; logout/forgot/reset/verify/profile expansion still missing.
- Session model (access + rotating refresh): **Missing**.
- RBAC matrix + enforcement middleware: **Missing**.
- Base app shell (header/sidebar/protected routes): **Missing**.
- API docs baseline for target API: **Missing**.

## Phase 2 Core domain MVP
- Projects/cost codes/budgets/COs/commitments/AP/AR/retainage/documents/dashboard/vendors/CRM:
  - Domain data and many read endpoints exist in Python backend.
  - Tenant-aware write workflows, approvals, and unified UX are **partially missing**.

## Phase 3 Commercialization
- Stripe-based money movement (AR requests + vendor payouts): **Planned next**; subscription monetization intentionally deferred.
- Transactional email provider integration: **Missing**.
- QuickBooks + bank/credit-card + vendor portal integration layer: **Missing/partial** (IDs exist in places, no unified integration service yet).

## Phase 4 Hardening
- Test matrix across unit/integration/component/E2E/security/performance: **Missing**.
- Security hardening (rate limits, CSRF strategy, strict headers, brute-force controls): **Partial**.
- Ops runbook/backup recovery process: **Missing**.

## Biggest delivery risks
1. Existing backend lacks tenant boundaries; retrofitting multi-tenant access must be first-class before UI scale-out.
2. No formal migration/versioning workflow risks schema drift.
3. No auth/RBAC means all current data routes are effectively unprotected for SaaS usage.
