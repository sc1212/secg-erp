# CURRENT STATE AUDIT (Reuse-First)

_Last updated: 2026-02-20_

## Audit method
- Read runtime entrypoint, router registration, all API modules, ORM model modules, importer pipeline modules, deployment files, and bootstrap scripts.
- Treated implemented repository behavior as the current **Status Baseline** in absence of a separate baseline file.
- Classified each capability as: **Reuse as-is**, **Refactor and keep**, **Replace**, **Missing (build new)**.

## Stack decision (locked unless you object)
- **Target architecture:** pnpm + Turborepo monorepo, TypeScript-first, Next.js (web) + NestJS (API), PostgreSQL + Prisma, Redis, BullMQ.
- **Current production baseline to preserve:** FastAPI + SQLAlchemy ingestion/reporting backend in `backend/`.
- **Execution strategy:** keep current backend running while building TypeScript platform in vertical slices.

## Coverage map

### 1) Existing features / screens / workflows
| Area | Current state | Classification |
|---|---|---|
| Executive dashboard KPIs | Cash/debt/projects/pipeline/payroll/alerts aggregation endpoint | **Refactor and keep** |
| Projects + job costing detail | Project list/detail + costs + SOV + draws + CO + milestones + transactions | **Reuse as-is** |
| Financial views | Debts, P&L, AR, cash forecast, retainage, recurring expenses, properties, transactions | **Reuse as-is** |
| CRM | Leads, proposals, pipeline and summary | **Reuse as-is** |
| Team ops | Employees, payroll calendar, crew allocation, lien waivers | **Reuse as-is** |
| Admin imports | Setup/reset/status + imports for masterfile/budgets/leads/proposals/jobs | **Refactor and keep** |
| Web UI app | No production web app in current repo | **Missing (build new)** |

### 2) Existing API routes inventory
- Router modules: `admin`, `dashboard`, `projects`, `vendors`, `financials`, `crm`, `team`.
- Endpoint style: read-heavy and import-admin focused.
- Mutation maturity: limited for core transactional workflows.

**Classification:**
- Domain read endpoints: **Reuse as-is** (short term).
- Import endpoints: **Refactor and keep** (auth, async, idempotency, audit hardening needed).
- Auth/org/RBAC/billing/upload policy endpoints: **Missing (build new)**.

### 3) Existing database model inventory
- Core domain models include projects, cost codes, commitments, change orders, SOV/pay apps, invoices/payments, documents/version links, workflow tasks, audit logs.
- Extended models include debts, cash forecast, payroll, milestones, retainage, pipeline, leads/proposals, crew/lien workflows.

**Classification:**
- Domain data model foundation: **Refactor and keep**.
- Tenant-aware identity/session schema: **Missing (build new)**.
- Billing/commercialization schema: **Missing (build new)**.
- File access/version policy hardening: **Refactor and keep**.

### 4) Platform and delivery readiness
| Capability | Current state | Classification |
|---|---|---|
| Docker local services | Present | **Reuse as-is** |
| Deploy blueprint | Present | **Reuse as-is** |
| Migration framework | Runtime `create_all`; no formal migration pipeline in repo | **Replace** |
| Monorepo foundation | Added scaffold and workspace config | **Refactor and keep** |
| CI | Missing | **Missing (build new)** |
| Automated tests | Minimal/none committed | **Missing (build new)** |

## Reuse-first conclusion
1. Do not rewrite existing finance/job-costing behavior before auth/tenant controls exist.
2. Build platform foundation first (identity, tenancy, RBAC, audit, API contracts, app shell).
3. Migrate domain modules in strict vertical slices with parity + tests.
