# REFACTOR PLAN (Vertical Slices, Reuse-First)

## Guiding approach
- Preserve and leverage existing backend finance/job-costing capabilities.
- Introduce a new TypeScript platform layer incrementally.
- Only replace components when compatibility/security/maintainability requires it.

## Slice 0 — Platform bootstrap (no domain rewrites)
1. Finalize docs + architecture map + permission matrix.
2. Add monorepo standards (pnpm/turbo/eslint/prettier/tsconfig/husky/lint-staged).
3. Add CI pipeline gates (lint/typecheck/test).
4. Introduce NestJS `apps/api` and Next.js `apps/web` skeletons.

## Slice 1 — Auth + tenant + RBAC foundation
1. DB: organizations, users, memberships, roles, permissions, sessions, audit events.
2. API: signup/login/logout/refresh/forgot/reset/verify/profile + org context switching.
3. UI: auth pages + protected shell + session-expired flow.
4. Tests: integration + validation + permission coverage.

## Slice 2 — Projects + cost codes + budgets
1. Typed contracts for projects list/detail and cost summaries.
2. Reuse existing project data source logic initially.
3. Deliver budget variance workflows with saved filters and drill-down.

## Slice 3 — Change orders + commitments + approvals
1. Approval policy engine (threshold and role-based routes).
2. CO lifecycle with budget impact snapshots.
3. Commitment linkage to CO and vendor obligations.

## Slice 4 — AP/AR, draws, retainage
1. AP invoice lifecycle and compliance checkpoints.
2. AR draws with SOV parity validations.
3. Retainage accrual/release controls.

## Slice 5 — Documents + dashboards + vendors + CRM
1. Document versioning and policy-aware retrieval.
2. KPI drill-through standardization.
3. Vendor scorecards and pipeline analytics.

## Slice 6 — Commercialization and intelligence
1. Stripe billing + webhook resilience.
2. QuickBooks sync jobs + reconciliation workflow.
3. Predictive risk analytics (overruns/cash crunch/anomalies).

## Replacement thresholds
Replace an existing module only if one of these applies:
- Cannot support tenant isolation safely.
- Cannot provide required auditability/permissions.
- Blocks typed contract stability or performance targets.
- Creates unacceptable operational/security risk.
