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
# REFACTOR PLAN — SECG ERP

**Date:** 2026-02-20
**Status:** Pending owner approval

---

## Critical Decision: Stack Strategy

### The Reality
The existing codebase is a **Python/FastAPI** backend with SQLAlchemy, 39 tables, 41 endpoints, and 7 production-quality data importers. The product spec calls for a **TypeScript/NestJS** backend.

### Recommendation: Keep Python Backend, Build TypeScript Frontend

**Rationale:**
1. The Python backend has ~5,000 lines of tested, domain-specific import logic mapping real SECG data
2. The 39-table SQLAlchemy schema is comprehensive and construction-specific
3. FastAPI generates OpenAPI docs automatically (spec requirement)
4. Rewriting the backend to TypeScript would burn weeks for zero user-facing value
5. The frontend (Next.js/React/TypeScript) is 100% missing and is where all user value lives
6. Python + FastAPI is production-grade — used by Netflix, Uber, Microsoft

**What changes:**
- Backend stays Python/FastAPI (not NestJS/Fastify)
- Frontend is Next.js + TypeScript (as specified)
- Monorepo holds both: `apps/api` (Python) + `apps/web` (Next.js)
- Shared types generated from OpenAPI spec (Python → TypeScript)
- pnpm + Turborepo manage the frontend; pip/Poetry manages Python

---

## Refactor Phases (ordered by priority)

### R1: Repository Restructure

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

**Files to move:**
- `backend/` → `apps/api/backend/`
- `requirements.txt` → `apps/api/requirements.txt`
- `Dockerfile` → `apps/api/Dockerfile`
- `Procfile` → `apps/api/Procfile`
- `setup.sh` → `apps/api/setup.sh`

**Files to keep at root:**
- `docker-compose.yml` (update paths)
- `render.yaml` (update paths)
- `.env.example` (expand)
- `docs/`

### R2: Database Migrations (Alembic)

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

### R3: Multi-Tenancy Layer

**Goal:** Every domain entity is scoped to an organization.

**Changes:**
1. Add `Organization` model (id, name, slug, plan, settings, created_at)
2. Add `organization_id` column to: projects, vendors, clients, employees, cost_events, invoices, payments, documents, leads, proposals, bid_pipeline, debts, properties, recurring_expenses, etc.
3. Create `TenantMiddleware` that extracts org from JWT and injects into request state
4. Create `get_tenant_db()` dependency that auto-filters queries by org_id
5. Update all existing endpoints to use tenant-scoped queries

**Strategy:** All existing endpoints are read-only GETs. We add org scoping as a transparent filter layer without rewriting query logic.

### R4: Authentication System

**Goal:** JWT-based auth with refresh token rotation.

**New files:**
- `backend/core/auth.py` — JWT creation/validation, password hashing
- `backend/core/security.py` — Rate limiting, security headers
- `backend/models/auth.py` — User, RefreshToken, PasswordResetToken
- `backend/api/auth.py` — signup, login, logout, refresh, forgot/reset password
- `backend/core/deps.py` — Add `get_current_user()`, `require_role()` dependencies

**Implementation:**
1. Email/password signup with bcrypt hashing
2. JWT access token (15min) + refresh token (7d, httponly cookie)
3. Refresh token rotation (invalidate old on use)
4. Password reset via email token
5. Email verification flow
6. Brute-force protection (rate limit login endpoint)

### R5: RBAC + Permissions

**Goal:** Role-based access control with per-org roles.

**Roles (initial):**
- `owner` — Full access, billing, user management
- `admin` — Full access except billing
- `finance` — Financial views, AP/AR, billing
- `project_manager` — Project CRUD, change orders, draws, vendors
- `field` — Read-only project data, daily logs, photos
- `viewer` — Read-only access

**Implementation:**
1. `Role` enum on `Membership` model
2. `Permission` matrix defined in code (not DB — simpler to maintain)
3. `require_permission()` FastAPI dependency
4. Protect all existing endpoints with permission checks
5. Document in `PERMISSIONS_MATRIX.md`

### R6: CRUD Write Endpoints

**Goal:** Add create/update/delete for all domain entities.

**Priority order (matches Phase 2):**
1. Projects — POST, PUT, DELETE
2. Cost Codes — POST, PUT, DELETE (project-scoped)
3. Budgets — PUT (bulk update on cost codes)
4. Change Orders — POST, PUT, PATCH (status transitions)
5. Commitments — POST, PUT, DELETE
6. AP Invoices — POST, PUT, PATCH (status)
7. AR / Draws — POST pay apps, PUT SOV lines
8. Documents — POST (upload), GET (download), DELETE
9. Vendors — POST, PUT, DELETE
10. CRM — POST/PUT leads, proposals, pipeline entries

**For each entity:**
- Create Pydantic request schemas (CreateX, UpdateX)
- Add validation (Zod-equivalent via Pydantic)
- Add audit logging on writes
- Add permission checks
- Return proper HTTP status codes (201 Created, 204 No Content)

### R7: Frontend Build (Next.js)

**Goal:** Build the entire UI from scratch using Next.js App Router.

This is the largest work item. See `ARCHITECTURE.md` (to be created) for the full component tree.

**Key pages to build:**
1. Auth screens (login, signup, forgot password, reset, verify email)
2. Dashboard (executive command center)
3. Projects (list, detail with tabs for costs/SOV/draws/COs/milestones)
4. Financials (debts, P&L, AR, AP, cash forecast, retainage, recurring)
5. Vendors (list, detail, scorecard)
6. CRM (leads, proposals, pipeline)
7. Team (employees, payroll, crew allocation, lien waivers)
8. Documents (file manager)
9. Settings (org, users, billing)

### R8: Testing Infrastructure

**Goal:** Test foundation from day one.

1. **Python backend:** pytest + httpx (TestClient) + test DB
2. **Frontend:** Vitest + React Testing Library + Playwright
3. **CI:** GitHub Actions running lint + typecheck + test on PR

---

## Execution Order

| Step | Description | Depends On |
|---|---|---|
| R1 | Repo restructure (monorepo) | — |
| R2 | Alembic migrations | R1 |
| R3 | Multi-tenancy models | R2 |
| R4 | Auth system | R2, R3 |
| R5 | RBAC + permissions | R4 |
| R7a | Frontend setup + app shell + auth screens | R1, R4 |
| R6a | CRUD: Projects + Cost Codes | R5 |
| R7b | Frontend: Dashboard + Projects | R6a |
| R6b | CRUD: Change Orders + Commitments | R5 |
| R7c | Frontend: Financials | R6b |
| R6c | CRUD: AP/AR + Draws | R5 |
| R7d | Frontend: Vendors + CRM | R6c |
| R8 | Testing infrastructure | R1 |
| R6d | CRUD: Documents + Vendors + CRM | R5 |
| R7e | Frontend: Team + Settings | R6d |

---

## Files Untouched (Reuse As-Is)

These files require NO changes:
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
