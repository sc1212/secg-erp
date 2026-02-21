# TECH DESIGN

## 1) Objective
Build a production-grade, multi-tenant construction finance + operations ERP that supports:
- enterprise financial controls,
- project execution workflows,
- field mobility,
- commercialization as a SaaS product.

The design must preserve and reuse existing domain capabilities in `backend/` while incrementally moving to the target TypeScript monorepo stack.

## 2) System context
### Current baseline (kept)
- FastAPI + SQLAlchemy backend with rich project/financial read APIs and importers.

### Target platform (locked)
- Frontend: Next.js App Router + Tailwind + Radix + React Hook Form + Zod + TanStack Query.
- Backend: NestJS REST API with OpenAPI docs.
- Data: PostgreSQL + Prisma.
- Async: Redis + BullMQ.
- Storage: S3-compatible object storage.
- Billing: Stripe.
- Email: Resend.

## 3) Architectural strategy
### Strangler migration
1. Keep existing backend operational for current data/reporting.
2. Add new platform primitives first (auth, tenant, RBAC, audit).
3. Move domain modules to target API via vertical slices.
4. Retire legacy endpoints only after parity + tests.

### Service boundaries (target)
- Identity Service: auth, sessions, verification, password reset.
- Org Access Service: organizations, memberships, role assignment.
- Project Finance Service: projects, budgets, cost codes, commitments, COs, draws, retainage.
- AP/AR Service: invoices, payments, aging, collections workflow.
- Document Service: metadata, versioning, access policy, audit trail.
- CRM Service: leads, proposals, win/loss analytics.
- Vendor Service: scorecards, compliance, performance history.
- Billing Service: subscription lifecycle + webhook reconciliation.
- Integration Service: QuickBooks sync pipelines + mapping rules.

## 4) Data model blueprint (target additions)
### Identity + tenancy
- organizations
- organization_divisions
- users
- memberships
- roles
- permissions
- role_permissions
- user_role_assignments
- user_sessions (refresh token family/rotation)
- auth_events (login success/failure/lockout)

### Compliance + controls
- approval_policies (threshold based)
- approval_steps
- approval_instances
- audit_events (material mutations)
- data_access_events (sensitive financial views)

### Billing + commercialization
- billing_customers
- billing_subscriptions
- billing_invoices
- billing_events
- usage_counters

### Integration reliability
- integration_connections
- sync_jobs
- sync_job_runs
- external_id_mappings
- reconciliation_issues

## 5) Security model
- JWT access tokens (short TTL) + rotating refresh tokens in secure httpOnly cookie.
- Token family invalidation on suspicious activity.
- Org-scoped policy enforcement on every endpoint.
- Permission-key authorization (not role-name checks directly).
- Request-level audit tags for material state changes.
- Brute-force protections for auth endpoints.
- Security headers + rate limits + input validation at every boundary.

## 6) Performance and reliability goals
- p95 API latency: < 300ms for common list/detail reads.
- Dashboard query path: pre-aggregated where needed + indexed rollups.
- Async import/sync jobs idempotent and retry-safe.
- Availability target: 99.9%.
- Backups: daily snapshot + PITR-capable configuration.

## 7) UX/interaction model
- Finance-first table workflows with filtering, saved views, export.
- Every KPI supports drill-down to source transactions.
- Mobile-specific field flows (daily logs/photos/updates) separated from finance-heavy views.
- Explicit loading/error/empty states for all major screens.

## 8) Testing and release strategy
- Per module minimum: integration + validation + permission + UI state test.
- Critical E2E journeys: login, project review, CO approval, AP entry, draw generation.
- CI gates: lint, typecheck, unit/integration tests, selective E2E smoke.
- Feature flags for high-risk migrations.

## 9) Initial implementation sequence
1. Auth + tenancy + RBAC + audit core.
2. App shell + protected routes + profile/session flows.
3. Projects + cost code + budget slice via typed contracts.
4. Change order/approval workflow.
5. AP/AR + retainage + draw workflow.
6. Documents/versioning/access.
7. Dashboard metric hardening and drill-through consistency.
8. Stripe + email + QuickBooks sync layer.
