# REFACTOR PLAN — SECG ERP

**Date:** 2026-02-20
**Status:** Pending owner approval

---

## Guiding Approach

- Preserve and leverage existing backend finance/job-costing capabilities.
- Keep Python/FastAPI backend (ADR-001), build Next.js/TypeScript frontend.
- Only replace components when compatibility/security/maintainability requires it.
- Migrate domain modules in strict vertical slices with parity + tests.

---

## Critical Decision: Stack Strategy

### The Reality
The existing codebase is a **Python/FastAPI** backend with SQLAlchemy, 39 tables, 41 endpoints, and 7 production-quality data importers. The product spec calls for a **TypeScript/NestJS** backend.

### Decision: Keep Python Backend, Build TypeScript Frontend

**Rationale:**
1. The Python backend has ~5,000 lines of tested, domain-specific import logic mapping real SECG data
2. The 39-table SQLAlchemy schema is comprehensive and construction-specific
3. FastAPI generates OpenAPI docs automatically (spec requirement)
4. Rewriting the backend to TypeScript would burn weeks for zero user-facing value
5. The frontend (Next.js/React/TypeScript) is 100% missing and is where all user value lives

**What changes:**
- Backend stays Python/FastAPI (not NestJS/Fastify)
- Frontend is Next.js + TypeScript (as specified)
- Monorepo holds both: `apps/api` (Python) + `apps/web` (Next.js)
- Shared types generated from OpenAPI spec (Python → TypeScript)
- pnpm + Turborepo manage the frontend; pip/Poetry manages Python

---

## Refactor Phases (Vertical Slices)

### Slice 0 — Platform Bootstrap (no domain rewrites)

**Goal:** Monorepo that holds Python API + Next.js frontend.

```
secg-erp/
├── apps/
│   ├── api/                    ← Move existing backend/ here
│   │   ├── backend/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── ...
│   └── web/                    ← New Next.js frontend
│       ├── src/
│       ├── package.json
│       └── ...
├── packages/                   ← Shared TS packages
│   └── shared-types/           ← Generated from OpenAPI
├── docs/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── ...
```

**Steps:**
1. Finalize docs + architecture map + permission matrix.
2. Add monorepo standards (pnpm/turbo/eslint/prettier/tsconfig/husky/lint-staged).
3. Add CI pipeline gates (lint/typecheck/test).
4. Introduce Next.js `apps/web` skeleton.

### Slice 1 — Database Migrations (Alembic)

**Goal:** Replace `Base.metadata.create_all()` with versioned Alembic migrations.

**Steps:**
1. Initialize Alembic in `apps/api/`
2. Generate initial migration from current schema (39 tables)
3. Create migration to add multi-tenancy columns:
   - `organizations` table
   - `users` table
   - `memberships` table (user↔org with role)
   - `organization_id` FK on all tenant-scoped tables
4. Create migration for auth tables:
   - `refresh_tokens` table
   - `password_reset_tokens` table
   - `email_verifications` table
5. Create migration for billing:
   - `subscriptions` table
   - `billing_events` table
6. Update `backend/main.py` lifespan to run Alembic instead of create_all

### Slice 2 — Auth + Tenant + RBAC Foundation

**Goal:** JWT-based auth with multi-tenancy and role-based access control.

1. DB: organizations, users, memberships, roles, permissions, sessions, audit events.
2. API: signup/login/logout/refresh/forgot/reset/verify/profile + org context switching.
3. Multi-tenancy middleware: extract org from JWT, inject into request state, auto-filter queries by org_id.
4. RBAC: permission matrix defined in code, `require_permission()` FastAPI dependency.
5. UI: auth pages + protected shell + session-expired flow.
6. Tests: integration + validation + permission coverage.

**Roles (initial):**
- `owner` — Full access, billing, user management
- `admin` — Full access except billing
- `finance` — Financial views, AP/AR, billing
- `project_manager` — Project CRUD, change orders, draws, vendors
- `field` — Read-only project data, daily logs, photos
- `viewer` — Read-only access

**New files:**
- `backend/core/auth.py` — JWT creation/validation, password hashing
- `backend/core/security.py` — Rate limiting, security headers
- `backend/models/auth.py` — User, RefreshToken, PasswordResetToken
- `backend/api/auth.py` — signup, login, logout, refresh, forgot/reset password
- `backend/core/deps.py` — Add `get_current_user()`, `require_role()` dependencies

### Slice 3 — Projects + Cost Codes + Budgets

1. CRUD write endpoints: Projects (POST, PUT, DELETE), Cost Codes, Budgets.
2. Typed contracts for projects list/detail and cost summaries.
3. Reuse existing project data source logic initially.
4. Deliver budget variance workflows with saved filters and drill-down.

### Slice 4 — Change Orders + Commitments + Approvals

1. Approval policy engine (threshold and role-based routes).
2. CO lifecycle with budget impact snapshots.
3. Commitment linkage to CO and vendor obligations.

### Slice 5 — AP/AR, Draws, Retainage

1. AP invoice lifecycle and compliance checkpoints.
2. AR draws with SOV parity validations.
3. Retainage accrual/release controls.

### Slice 6 — Documents + Dashboards + Vendors + CRM

1. Document versioning with S3 presigned URLs and policy-aware retrieval.
2. KPI drill-through standardization.
3. Vendor scorecards and CRM pipeline analytics.

### Slice 7 — Commercialization and Intelligence

1. Stripe billing + webhook resilience (AR/AP money movement first per ADR-010).
2. QuickBooks sync jobs + reconciliation workflow.
3. Predictive risk analytics (overruns/cash crunch/anomalies).

### Slice 8 — Testing Infrastructure

1. **Python backend:** pytest + httpx (TestClient) + test DB
2. **Frontend:** Vitest + React Testing Library + Playwright
3. **CI:** GitHub Actions running lint + typecheck + test on PR

---

## Execution Order

| Step | Description | Depends On |
|---|---|---|
| S0 | Repo restructure (monorepo) | — |
| S1 | Alembic migrations | S0 |
| S2 | Auth + tenancy + RBAC | S1 |
| S8 | Testing infrastructure | S0 |
| S2-UI | Frontend setup + app shell + auth screens | S0, S2 |
| S3 | CRUD: Projects + Cost Codes | S2 |
| S3-UI | Frontend: Dashboard + Projects | S3 |
| S4 | Change Orders + Commitments | S2 |
| S4-UI | Frontend: Financials | S4 |
| S5 | AP/AR + Draws | S2 |
| S5-UI | Frontend: Vendors + CRM | S5 |
| S6 | Documents + Vendors + CRM | S2 |
| S6-UI | Frontend: Team + Settings | S6 |
| S7 | Commercialization | S5 |

---

## Replacement Thresholds

Replace an existing module only if one of these applies:
- Cannot support tenant isolation safely.
- Cannot provide required auditability/permissions.
- Blocks typed contract stability or performance targets.
- Creates unacceptable operational/security risk.

---

## Files Untouched (Reuse As-Is)

These files require NO changes (except adding auth middleware / tenant filter):
- `backend/importers/masterfile.py`
- `backend/importers/budgets.py`
- `backend/importers/leads.py`
- `backend/importers/jobs.py`
- `backend/importers/schedule.py`
- `backend/importers/orchestrator.py`
- `backend/importers/base.py`
- `backend/models/core.py` (only add org_id column via migration)
- `backend/models/extended.py` (only add org_id column via migration)
- `backend/schemas/__init__.py` (extend, don't rewrite)
- `backend/api/dashboard.py` (add auth middleware, don't rewrite logic)
- `backend/api/projects.py` (add auth + tenant filter)
- `backend/api/financials.py` (add auth + tenant filter)
- `backend/api/vendors.py` (add auth + tenant filter)
- `backend/api/crm.py` (add auth + tenant filter)
- `backend/api/team.py` (add auth + tenant filter)
- `validate_imports.py`

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Multi-tenancy migration breaks existing data | High | Run on empty DB first, then write data migration script for SECG data |
| Python ↔ TypeScript type drift | Medium | Generate TS types from OpenAPI spec automatically |
| Import logic assumes single tenant | Medium | Add default org assignment during import |
| No tests means refactors are risky | High | Write integration tests for existing endpoints BEFORE refactoring |
