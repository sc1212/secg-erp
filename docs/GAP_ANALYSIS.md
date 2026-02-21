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
# GAP ANALYSIS — SECG ERP

**Date:** 2026-02-20
**Reference:** CURRENT_STATE_AUDIT.md, Product Requirements Spec

---

## Legend

- **HAVE** = Exists and is usable
- **PARTIAL** = Some work done, needs completion
- **GAP** = Does not exist, must be built

---

## Phase 0: Foundation

| Requirement | Status | Detail |
|---|---|---|
| Monorepo structure (pnpm + Turborepo) | **PARTIAL** | Workspace placeholders added. Need to restructure for monorepo with `apps/api` (Python backend) and `apps/web` (Next.js frontend). |
| TypeScript everywhere | **GAP** | Backend is Python/FastAPI. **Decision:** keep Python backend (ADR-001). |
| TS strict/lint/format/husky/lint-staged | **GAP** | No ruff/black/isort for Python. No ESLint/Prettier for TS. |
| Docker/local dev | **HAVE** | docker-compose.yml with PG16 + Redis7. |
| CI skeleton | **GAP** | No GitHub Actions. |
| Base docs | **PARTIAL** | README.md + audit docs started. Missing 10+ required docs. |
| Environment configs | **PARTIAL** | `.env.example` exists but minimal. |

## Phase 1: Core Platform

| Requirement | Status | Detail |
|---|---|---|
| **Organizations (tenants)** | **GAP** | No `organizations` table, no org model. |
| **Users model** | **GAP** | No `users` table. `employees` exists but is not a user/auth model. |
| **Memberships (user↔org)** | **GAP** | No membership/role-in-org model. |
| **Auth: signup/login/me baseline** | **PARTIAL** | In progress; logout/forgot/reset/verify/profile expansion still missing. |
| **Auth: forgot/reset password** | **GAP** | No email service, no password reset flow. |
| **Auth: email verification** | **GAP** | No email service. |
| **Auth: profile page** | **GAP** | No user-facing UI. |
| **Session handling (JWT + refresh)** | **GAP** | SECRET_KEY exists in config but rotation not implemented. |
| **RBAC + permissions matrix** | **GAP** | No roles, no permissions, no middleware. |
| **App shell (header, sidebar, routing)** | **GAP** | No frontend exists. |
| **Design tokens + theming** | **GAP** | No frontend exists. |
| **Error boundaries + loading states** | **GAP** | No frontend exists. |
| **API docs generation** | **HAVE** | FastAPI auto-generates OpenAPI at `/api/docs`. |

## Phase 2: Core Domain MVP

| Requirement | Status | Detail |
|---|---|---|
| 1. **Orgs/users/roles/permissions** | **GAP** | Nothing exists. |
| 2. **Projects** | **PARTIAL** | Read endpoints: HAVE. Schema: HAVE. Write (create/update/delete): GAP. |
| 3. **Cost codes** | **PARTIAL** | Read: HAVE. Write: GAP. Budget rollup queries: HAVE (via import). |
| 4. **Budgets** | **PARTIAL** | Budget amounts on cost codes: HAVE. Budget management UI/CRUD: GAP. |
| 5. **Change orders** | **PARTIAL** | Schema: HAVE. Read: HAVE. Create/approve/reject flow: GAP. |
| 6. **Commitments (POs/Subs)** | **PARTIAL** | Schema: HAVE. Read: implicit in project detail. Dedicated CRUD: GAP. |
| 7. **AP invoices** | **PARTIAL** | Schema: HAVE (invoices table). Dedicated AP endpoints: GAP. |
| 8. **AR / draws / retainage** | **PARTIAL** | Read endpoints: HAVE. SOV, pay apps, retainage schemas: HAVE. CRUD: GAP. |
| 9. **Documents / attachments** | **PARTIAL** | Schema: HAVE (documents, versions, links). Upload/download/S3: GAP. |
| 10. **Dashboard metrics** | **HAVE** | Full dashboard endpoint with cash, debt, projects, pipeline, payroll, alerts. |
| 11. **Vendors + scorecards** | **PARTIAL** | Read + scorecard: HAVE. CRUD + score management: GAP. |
| 12. **CRM leads/proposals/pipeline** | **PARTIAL** | Read + funnel summary: HAVE. CRUD + pipeline management: GAP. |

## Phase 3: Commercialization

| Requirement | Status | Detail |
|---|---|---|
| Stripe-based money movement (AR/AP) | **GAP** | Planned next per ADR-010; subscription monetization intentionally deferred. |
| Billing admin pages | **GAP** | No frontend, no billing data model. |
| Email notifications | **GAP** | No email service integrated. |
| QuickBooks integration | **PARTIAL** | QB ID fields on models (qb_txn_id, qb_vendor_id, etc.): HAVE. Sync service: GAP. |
| Org administration | **GAP** | No org model. |
| Usage telemetry | **GAP** | No monitoring. |

## Phase 4: Hardening

| Requirement | Status | Detail |
|---|---|---|
| Unit tests | **GAP** | Zero tests. |
| Integration tests | **GAP** | Zero tests. |
| Component tests | **GAP** | No frontend. |
| E2E tests | **GAP** | No frontend. |
| Auth tests | **GAP** | No auth. |
| Payment/webhook tests | **GAP** | No payments. |
| Performance optimization | **GAP** | No query optimization, no caching, no lazy loading. |
| Security hardening | **GAP** | No rate limiting, no security headers, no CSRF. |
| Backup/recovery docs | **GAP** | No operational runbook. |
| Developer onboarding | **GAP** | Only basic README. |

---

## Frontend Gaps (100% missing)

The entire frontend is a gap. Specifically needed:

| Component | Status |
|---|---|
| Next.js app setup | GAP |
| App shell (header, sidebar, layout) | GAP |
| Auth screens (login, signup, forgot, reset, verify, profile) | GAP |
| Dashboard page | GAP |
| Projects list + detail pages | GAP |
| Job costing views (cost codes, budget vs actual) | GAP |
| Change order management | GAP |
| SOV / draw builder | GAP |
| AP/AR views | GAP |
| Cash forecast view | GAP |
| Retainage tracker | GAP |
| Vendor list + scorecard | GAP |
| CRM pipeline + leads | GAP |
| Team/HR views | GAP |
| Documents management | GAP |
| Settings/admin pages | GAP |
| Responsive/mobile layouts | GAP |
| Design system / component library | GAP |

---

## Backend Gaps (CRUD + Platform Services)

| Category | Existing | Missing |
|---|---|---|
| **Read endpoints** | 35 GET endpoints | Mostly complete for Phase 2 reads |
| **Write endpoints** | 6 POST (admin/import only) | CREATE/UPDATE/DELETE for all 12 domain entities |
| **Auth middleware** | None | JWT auth, refresh tokens, session management |
| **RBAC middleware** | None | Permission checks on every endpoint |
| **Tenant middleware** | None | Org scoping on every query |
| **Request validation** | Response schemas only | Create/Update Pydantic schemas for all entities |
| **Audit logging** | Table exists, unused | Middleware to auto-log changes |
| **Error handling** | Basic HTTPException | Global error handler, structured errors |
| **Rate limiting** | None | Auth endpoint rate limiting at minimum |
| **Background jobs** | Redis in docker, unused | BullMQ/Celery for imports, email, sync |
| **Email service** | None | Resend/Postmark for transactional email |
| **File uploads** | None | S3 presigned URLs, MIME validation |
| **Stripe billing** | None | Checkout, subscriptions, webhooks |
| **QuickBooks sync** | Fields exist on models | OAuth, sync service, mapping logic |

---

## Documentation Gaps

| Required Doc | Status |
|---|---|
| `/docs/TECH_DESIGN.md` | GAP |
| `/docs/ARCHITECTURE.md` | GAP |
| `/docs/DECISIONS.md` | HAVE |
| `/docs/ROADMAP.md` | GAP |
| `/docs/OPEN_QUESTIONS.md` | HAVE |
| `/docs/API_SPEC.md` | PARTIAL (OpenAPI auto-generated, no manual spec) |
| `/docs/PERMISSIONS_MATRIX.md` | GAP |
| `/docs/ERD.md` | GAP |
| `/docs/TEST_PLAN.md` | GAP |
| `/docs/ONBOARDING.md` | GAP |
| `/docs/RUNBOOK.md` | GAP |
| `/docs/CURRENT_STATE_AUDIT.md` | HAVE |
| `/docs/GAP_ANALYSIS.md` | HAVE (this file) |
| `/docs/REFACTOR_PLAN.md` | HAVE |

---

## Biggest Delivery Risks

1. Existing backend lacks tenant boundaries; retrofitting multi-tenant access must be first-class before UI scale-out.
2. No formal migration/versioning workflow risks schema drift.
3. No auth/RBAC means all current data routes are effectively unprotected for SaaS usage.

---

## Effort Estimate by Phase

| Phase | % Complete | Primary Work |
|---|---|---|
| Phase 0: Foundation | ~15% | Monorepo restructure, CI, linting, docs skeletons |
| Phase 1: Core Platform | ~0% | Auth, users, orgs, RBAC, app shell, frontend setup |
| Phase 2: Core Domain MVP | ~25% | CRUD endpoints, frontend pages for each domain entity |
| Phase 3: Commercialization | ~5% | Stripe, email, QB sync, org admin |
| Phase 4: Hardening | ~0% | Full test suite, security, performance, docs |

**Overall project completion: ~10-12%**
The bulk of the work (schemas, read APIs, importers, domain models) saves significant time vs. greenfield. The domain model is the hardest part of a construction ERP and it's already done well.
