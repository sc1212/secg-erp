# CURRENT STATE AUDIT — SECG ERP

**Date:** 2026-02-20
**Auditor:** Principal Engineer (Claude)
**Scope:** Full codebase audit — reuse-first strategy

---

## Audit Method

- Read runtime entrypoint, router registration, all API modules, ORM model modules, importer pipeline modules, deployment files, and bootstrap scripts.
- Treated implemented repository behavior as the current **Status Baseline** in absence of a separate baseline file.
- Classified each capability as: **Reuse as-is**, **Refactor and keep**, **Replace**, **Missing (build new)**.

## Stack Decision (locked unless owner objects)

- **Target architecture:** pnpm + Turborepo monorepo, TypeScript frontend (Next.js), Python/FastAPI backend (kept — see ADR-001), PostgreSQL + Prisma/SQLAlchemy, Redis, BullMQ.
- **Current production baseline to preserve:** FastAPI + SQLAlchemy ingestion/reporting backend in `backend/`.
- **Execution strategy:** keep current backend running while building Next.js frontend and adding platform layers (auth, tenancy, RBAC) in vertical slices.

---

## 1. Repository Overview

| Attribute | Value |
|---|---|
| **Language** | Python 3 |
| **Framework** | FastAPI 0.115.6 |
| **ORM** | SQLAlchemy 2.0.36 |
| **Database** | PostgreSQL 16 (Docker) |
| **Cache/Queue** | Redis 7 (Docker, not yet used in code) |
| **Package Manager** | pip (requirements.txt) |
| **Deployment** | Render (render.yaml), Docker Compose for local dev |
| **Frontend** | **NONE** — backend API only, no UI code exists |
| **Tests** | **NONE** — zero test files |
| **CI/CD** | **NONE** — no GitHub Actions, no CI config |
| **Auth** | **NONE** — no authentication or authorization |
| **Multi-tenant** | **NONE** — single-tenant, no org/user model |
| **Migrations** | **NONE** — uses `Base.metadata.create_all()` (no Alembic versions) |

---

## 2. Database Schema (39 Tables)

### 2a. Core Models (`backend/models/core.py`) — 21 entities

| Model | Table | Status | Verdict |
|---|---|---|---|
| Client | `clients` | **Reuse** | Solid. Add `organization_id` for multi-tenancy. |
| Employee | `employees` | **Refactor** | Needs user account linkage, org scoping. |
| Vendor | `vendors` | **Reuse** | Good schema. Add org scoping. |
| Project | `projects` | **Reuse** | Comprehensive. Add org scoping. |
| CostCode | `cost_codes` | **Reuse** | Well-structured with budget/actual/committed/variance. |
| Contract | `contracts` | **Reuse** | Basic but functional. |
| Commitment | `commitments` | **Reuse** | Good — PO/subcontract tracking with status lifecycle. |
| ChangeOrder | `change_orders` | **Reuse** | Has approval workflow fields. Add `approved_by` FK to users. |
| CostEvent | `cost_events` | **Reuse** | Canonical actuals ledger — excellent design. Multi-source support. |
| Quote | `quotes` | **Reuse** | Vendor quote tracking with approval flag. |
| SOVLine | `sov_lines` | **Reuse** | AIA G702/G703 compatible fields. |
| PayApp | `pay_apps` | **Reuse** | Draw/pay app with full lifecycle (draft→paid). |
| PayAppLine | `pay_app_lines` | **Reuse** | Per-SOV-line draw detail. |
| Invoice | `invoices` | **Reuse** | AR invoices with aging-ready status. |
| InvoiceLine | `invoice_lines` | **Reuse** | Line items for invoices. |
| Payment | `payments` | **Reuse** | Payment records with lien waiver status. |
| Document | `documents` | **Reuse** | File metadata. Missing S3/presigned URL support. |
| DocumentVersion | `document_versions` | **Reuse** | Versioning support exists. |
| DocumentLink | `document_links` | **Reuse** | Polymorphic entity linking. |
| WorkflowTask | `workflow_tasks` | **Reuse** | Approval workflow engine (CO, pay app, variance). |
| AuditLog | `audit_log` | **Reuse** | Field-level audit trail. |

### 2b. Extended Models (`backend/models/extended.py`) — 18 entities

| Model | Table | Status | Verdict |
|---|---|---|---|
| Debt | `debts` | **Reuse** | Debt schedule with type classification. |
| Property | `properties` | **Reuse** | Portfolio tracking with ARV/LTV/exit strategy. |
| ChartOfAccounts | `chart_of_accounts` | **Reuse** | QB-compatible COA with hierarchy. |
| RecurringExpense | `recurring_expenses` | **Reuse** | Recurring expense tracking. |
| CashSnapshot | `cash_snapshots` | **Reuse** | Point-in-time cash balances. |
| CashForecastLine | `cash_forecast_lines` | **Reuse** | 13-week cash forecast. |
| PhaseSyncEntry | `phase_sync_entries` | **Reuse** | Material/supplier phase tracking. |
| PayrollEntry | `payroll_entries` | **Reuse** | Employee payroll data. |
| PayrollCalendar | `payroll_calendar` | **Reuse** | Pay schedule management. |
| PLEntry | `pl_entries` | **Reuse** | P&L by division/period/account. |
| Scenario | `scenarios` | **Reuse** | Financial scenario modeling. |
| ScenarioAssumption | `scenario_assumptions` | **Reuse** | Variables for scenarios. |
| DataSource | `data_sources` | **Reuse** | Import tracking/provenance. |
| LienWaiver | `lien_waivers` | **Reuse** | Conditional/unconditional waiver tracking. |
| ProjectMilestone | `project_milestones` | **Reuse** | Schedule milestones with dependency support. |
| RetainageEntry | `retainage_entries` | **Reuse** | Receivable + payable retainage. |
| BidPipeline | `bid_pipeline` | **Reuse** | CRM opportunity tracking. |
| CrewAllocation | `crew_allocations` | **Reuse** | Weekly crew assignment matrix. |
| Lead | `leads` | **Reuse** | BuilderTrend CRM leads. |
| LeadProposal | `lead_proposals` | **Reuse** | Lead proposal tracking. |

### 2c. Enums (14 defined)

All enums are well-designed with construction-specific values:
`ProjectStatus`, `ProjectType`, `CostEventType`, `CostEventSource`, `CommitmentStatus`, `ChangeOrderStatus`, `PayAppStatus`, `InvoiceStatus`, `PaymentMethod`, `LienWaiverStatus`, `WorkflowAction`, `WorkflowTaskStatus`, `QuoteStatus`, `LeadStatus`, `ProposalStatus`, `DebtType`, `PropertyExitStrategy`, `RecurringFrequency`, `BidStatus`, `MilestoneStatus`

**Verdict: Reuse all enums as-is.**

---

## 3. API Layer (7 route modules)

### `backend/api/admin.py` — Admin & Import
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/admin/setup` | POST | **Refactor** — Replace with Alembic migrations. |
| `/api/admin/reset` | POST | **Refactor** — Dev-only, gate behind auth + env check. |
| `/api/admin/status` | GET | **Reuse** — Useful admin diagnostic. |
| `/api/admin/import/masterfile` | POST | **Reuse** — Core data pipeline. |
| `/api/admin/import/budgets` | POST | **Reuse** — Budget CSV batch import. |
| `/api/admin/import/leads` | POST | **Reuse** — BuilderTrend leads. |
| `/api/admin/import/proposals` | POST | **Reuse** — BuilderTrend proposals. |
| `/api/admin/import/jobs` | POST | **Reuse** — Open jobs + quotes. |

### `backend/api/dashboard.py` — Executive Dashboard
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/dashboard` | GET | **Reuse** — Aggregated KPI endpoint with cash, debt, projects, pipeline, payroll, alerts. |

### `backend/api/projects.py` — Project Management
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/projects` | GET | **Reuse** — Paginated, searchable, filterable. |
| `/api/projects/{id}` | GET | **Reuse** — Full detail with cost codes, SOV, draws, COs, milestones. |
| `/api/projects/{id}/costs` | GET | **Reuse** — Cost code breakdown. |
| `/api/projects/{id}/sov` | GET | **Reuse** — Schedule of values. |
| `/api/projects/{id}/draws` | GET | **Reuse** — Pay app history. |
| `/api/projects/{id}/cos` | GET | **Reuse** — Change orders. |
| `/api/projects/{id}/milestones` | GET | **Reuse** — Schedule milestones. |
| `/api/projects/{id}/transactions` | GET | **Reuse** — Paginated cost events. |

### `backend/api/financials.py` — Financial Views
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/financials/debts` | GET | **Reuse** — Debt schedule. |
| `/api/financials/pl` | GET | **Reuse** — P&L with division/period filter. |
| `/api/financials/pl/summary` | GET | **Reuse** — Monthly P&L summary for charts. |
| `/api/financials/ar` | GET | **Reuse** — AR aging. |
| `/api/financials/cash-forecast` | GET | **Reuse** — 13-week forecast. |
| `/api/financials/cash-forecast/weekly` | GET | **Reuse** — Aggregated weekly for charts. |
| `/api/financials/retainage` | GET | **Reuse** — Retainage tracker. |
| `/api/financials/recurring` | GET | **Reuse** — Recurring expenses. |
| `/api/financials/properties` | GET | **Reuse** — Property portfolio. |
| `/api/financials/transactions` | GET | **Reuse** — Paginated transaction log. |

### `backend/api/vendors.py` — Vendor Management
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/vendors` | GET | **Reuse** — Paginated, filterable by trade. |
| `/api/vendors/{id}` | GET | **Reuse** — Full vendor detail. |
| `/api/vendors/scorecard` | GET | **Reuse** — Ranked scorecard with composite score. |

### `backend/api/crm.py` — CRM & Pipeline
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/crm/leads` | GET | **Reuse** — Paginated leads with status/salesperson filter. |
| `/api/crm/proposals` | GET | **Reuse** — Lead proposals. |
| `/api/crm/pipeline` | GET | **Reuse** — Bid pipeline. |
| `/api/crm/pipeline/summary` | GET | **Reuse** — Funnel summary for charts. |
| `/api/crm/leads/by-salesperson` | GET | **Reuse** — Sales performance grouping. |

### `backend/api/team.py` — Team & HR
| Endpoint | Method | Verdict |
|---|---|---|
| `/api/team/employees` | GET | **Reuse** — Employee roster. |
| `/api/team/payroll-calendar` | GET | **Reuse** — Payroll dates. |
| `/api/team/crew-allocation` | GET | **Reuse** — Weekly crew matrix. |
| `/api/team/lien-waivers` | GET | **Reuse** — Lien waiver tracker. |
| `/api/team/lien-waivers/risk` | GET | **Reuse** — Risk assessment by vendor. |

**Total existing endpoints: ~35 GET, 6 POST = 41 endpoints**

---

## 4. Pydantic Schemas (`backend/schemas/__init__.py`)

27 response schemas defined. All use `from_attributes=True` for ORM compatibility.

**Verdict: Reuse all.** Will need to add request/create/update schemas (currently only response schemas exist — no CRUD write operations).

---

## 5. Import Pipeline (6 importers)

| Importer | File | Records | Verdict |
|---|---|---|---|
| MasterfileImporter | `importers/masterfile.py` | ~5,000 from 28 tabs | **Reuse** — Thoroughly mapped to real SECG data. |
| BudgetCSVImporter | `importers/budgets.py` | ~6 project budgets | **Reuse** — Creates cost codes, SOV, pay apps. |
| LeadsImporter | `importers/leads.py` | BuilderTrend leads | **Reuse** — Column-mapped. |
| ProposalsImporter | `importers/leads.py` | Lead proposals | **Reuse** — Dedup, lead linkage. |
| OpenJobsImporter | `importers/jobs.py` | Jobs + quotes | **Reuse** — Two-tab import. |
| ScheduleImporter | `importers/schedule.py` | ~170 milestones | **Reuse** — Hard-coded from PDF parse. |
| Orchestrator | `importers/orchestrator.py` | Full pipeline | **Reuse** — Dependency-ordered import. |

**Verdict: All importers are production-quality for the initial data load. Reuse as-is.**

---

## 6. Infrastructure

| Component | Status | Verdict |
|---|---|---|
| `docker-compose.yml` | PostgreSQL 16 + Redis 7 | **Reuse** |
| `render.yaml` | Render deployment config | **Reuse** |
| `Dockerfile` | Basic Python image | **Refactor** — Needs multi-stage build. |
| `Procfile` | Uvicorn start | **Reuse** |
| `setup.sh` | Local dev quickstart | **Reuse** |
| `.env.example` | Environment template | **Refactor** — Add auth/email/stripe vars. |
| `.gitignore` | Basic Python ignores | **Refactor** — Add Node.js ignores for frontend. |
| `validate_imports.py` | Standalone import validator | **Reuse** — Good QA tool. |

---

## 7. What Does NOT Exist (Gaps)

| Category | Gap |
|---|---|
| **Frontend** | No UI at all — zero HTML, CSS, JS, React, or Next.js code. |
| **Authentication** | No user model, no login/signup, no JWT, no session management. |
| **Authorization** | No RBAC, no permissions, no role model. |
| **Multi-tenancy** | No organization model, no tenant scoping on any table. |
| **CRUD writes** | All endpoints are read-only GET. No POST/PUT/PATCH/DELETE for domain entities. |
| **Request validation** | No create/update Pydantic schemas (only response schemas). |
| **Migrations** | No Alembic version files — uses create_all() for DDL. |
| **Tests** | Zero test files of any kind. |
| **CI/CD** | No GitHub Actions or any CI configuration. |
| **Docs** | Only README.md exists. No architecture, design, or API docs. |
| **Email** | No transactional email service. |
| **Payments/Billing** | No Stripe integration. |
| **File storage** | No S3 integration. Documents table exists but no upload/download flow. |
| **Background jobs** | Redis in docker-compose but no BullMQ/Celery/task queue code. |
| **Monitoring** | No error tracking, no health metrics beyond `/health`. |
| **Security** | No rate limiting, no CSRF, no security headers beyond CORS. |
| **QuickBooks** | QB fields on models (qb_txn_id, qb_vendor_id) but no sync implementation. |

---

## 8. Code Quality Assessment

### Strengths
- Clean, well-organized Python with clear module separation
- Comprehensive construction-domain schema (39 tables, 20+ enums)
- Real production data mapped (not toy data) — actual SECG masterfile columns
- Good use of SQLAlchemy relationships
- Pagination pattern established
- Pydantic v2 response schemas
- QuickBooks dedup fields pre-built on models
- Audit log table exists
- Workflow task table exists
- Document versioning table exists

### Weaknesses
- Zero test coverage
- No write endpoints (CRUD) — read-only API
- No authentication or authorization whatsoever
- No multi-tenant scoping
- No proper migrations (Alembic configured in requirements but no versions)
- N+1 query risks in crew allocation endpoint
- Some hardcoded values (year=2025 in schedule importer)
- No input validation on read endpoints (SQL injection risk via `ilike` patterns)
- No structured logging
- No request ID middleware

---

## 9. Reuse-First Conclusion

1. Do not rewrite existing finance/job-costing behavior before auth/tenant controls exist.
2. Build platform foundation first (identity, tenancy, RBAC, audit, API contracts, app shell).
3. Migrate domain modules in strict vertical slices with parity + tests.

---

## Summary Counts

| Category | Reuse | Refactor | Replace | Missing |
|---|---|---|---|---|
| DB Models | 39 | 0 | 0 | ~5 (users, orgs, roles, memberships, subscriptions) |
| Enums | 20 | 0 | 0 | ~3 (user roles, org tiers, subscription status) |
| API Endpoints | 41 | 2 | 0 | ~60+ (all CRUD writes, auth, admin, billing) |
| Schemas | 27 | 0 | 0 | ~40+ (create/update schemas, auth schemas) |
| Importers | 7 | 0 | 0 | 0 |
| Frontend | 0 | 0 | 0 | Entire frontend |
| Tests | 0 | 0 | 0 | Entire test suite |
| Docs | 1 | 1 | 0 | 10+ required docs |
| CI/CD | 0 | 0 | 0 | Full pipeline |
| Auth/RBAC | 0 | 0 | 0 | Full system |
| Multi-tenancy | 0 | 0 | 0 | Full system |
