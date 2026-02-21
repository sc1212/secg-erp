# SECG ERP — Current State Audit

**Date**: 2026-02-21
**Verdict**: NOT PRODUCTION-READY
**Estimated Completion**: Backend ~75% | Frontend ~30% | Auth 0% wired | Data Integration ~15%

---

## 1. Executive Summary

The SECG ERP application has a well-architected backend with 45+ database models, 6 working data importers, and 30+ API endpoints. The UI is visually polished with a dark theme and gold accents. However, the frontend is almost entirely running on **hardcoded demo data** — it does not use the real API for most pages. Authentication exists in the backend but is **completely disconnected** from the frontend. The login page is a fake redirect. Multiple API endpoints will crash due to schema/model field mismatches. Several critical security issues exist (no auth on admin/reset, CORS wildcard issues).

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Backend | FastAPI + Uvicorn | latest | Python 3.11 |
| ORM | SQLAlchemy | 2.x | 45+ models across 2 files |
| Database | PostgreSQL | 16 | via docker-compose |
| Cache | Redis | 7 | Configured but unused |
| Frontend | React | 19 | Vite 7 + Tailwind CSS 4 |
| Charts | Recharts | latest | Used on Dashboard only |
| Icons | Lucide React | latest | Consistent icon set |
| Auth | python-jose + passlib | optional imports | JWT HS256 |
| Billing | Stripe SDK | latest | 3 plans ($299/$699/$1499) |
| Deploy | Docker + Railway/Render | - | Procfile + Dockerfile |

---

## 3. File-by-File Audit

### 3.1 Backend Core

#### `backend/main.py` (67 lines)
- FastAPI app with CORS middleware, `/health` endpoint, auto `create_all` in debug mode
- **Clean** — no issues

#### `backend/core/config.py` (49 lines)
- Settings from env vars via `@dataclass`
- **BUG** (line 38): CORS origin `https://*.up.railway.app` — wildcard subdomain patterns are **not valid** in the CORS `allow_origins` list. FastAPI/Starlette treats this as a literal string, not a pattern. No Railway deployment will have working CORS.
- **BUG** (line 23): `secret_key` defaults to `"dev-secret-change-in-production"` — if deployed without setting `SECRET_KEY` env var, all JWT tokens use a known secret.
- P&L year defaults to 2025 at `financials.py:52` and `financials.py:69`

#### `backend/core/database.py` (28 lines)
- SQLAlchemy engine with pool_size=10, max_overflow=20, pool_pre_ping=True
- **Clean**

#### `backend/core/deps.py` (17 lines)
- `get_db()` generator for dependency injection
- **Clean**

---

### 3.2 Backend Models

#### `backend/models/core.py` (589 lines) — 26 Models

| # | Model | Table | Lines | Used By API? | Used By Importer? |
|---|-------|-------|-------|-------------|-------------------|
| 1 | Client | clients | 165-181 | No | masterfile |
| 2 | Employee | employees | 185-199 | team.py | masterfile |
| 3 | Vendor | vendors | 204-229 | vendors.py | masterfile |
| 4 | Project | projects | 234-269 | projects.py | masterfile, budgets |
| 5 | CostCode | cost_codes | 273-291 | projects.py | masterfile, budgets |
| 6 | **Contract** | contracts | 295-306 | **NONE** | **NONE** |
| 7 | Commitment | commitments | 310-329 | No | masterfile |
| 8 | ChangeOrder | change_orders | 333-351 | projects.py | masterfile |
| 9 | CostEvent | cost_events | 356-378 | financials.py | masterfile |
| 10 | Quote | quotes | 383-403 | No | masterfile |
| 11 | SOVLine | sov_lines | 408-427 | projects.py | masterfile, budgets |
| 12 | PayApp | pay_apps | 431-451 | projects.py | masterfile, budgets |
| 13 | PayAppLine | pay_app_lines | 454-470 | No | No |
| 14 | Invoice | invoices | 475-491 | financials.py | masterfile |
| 15 | **InvoiceLine** | invoice_lines | 494-502 | **NONE** | **NONE** |
| 16 | **Payment** | payments | 507-520 | **NONE** | **NONE** |
| 17 | **Document** | documents | 525-534 | **NONE** | **NONE** |
| 18 | **DocumentVersion** | document_versions | 537-545 | **NONE** | **NONE** |
| 19 | **DocumentLink** | document_links | 548-554 | **NONE** | **NONE** |
| 20 | **WorkflowTask** | workflow_tasks | 559-571 | **NONE** | **NONE** |
| 21 | AuditLog | audit_log | 576-589 | No | base.py (log_audit exists but never called) |

**Bold = ORPHAN models** — defined in schema but never read or written by any API endpoint or importer.

**14 Enums defined** (lines 22-152): ProjectStatus, ProjectType, CostEventType, CostEventSource, CommitmentStatus, ChangeOrderStatus, PayAppStatus, InvoiceStatus, PaymentMethod, LienWaiverStatus, WorkflowAction, WorkflowTaskStatus, QuoteStatus, LeadStatus, ProposalStatus.

#### `backend/models/extended.py` (467 lines) — 21 Models

| # | Model | Table | Lines | Used By API? | Used By Importer? |
|---|-------|-------|-------|-------------|-------------------|
| 1 | Debt | debts | 71-87 | financials.py, dashboard.py | masterfile |
| 2 | Property | properties | 92-109 | financials.py | masterfile |
| 3 | ChartOfAccounts | chart_of_accounts | 114-124 | No | masterfile |
| 4 | RecurringExpense | recurring_expenses | 129-141 | financials.py | masterfile |
| 5 | CashSnapshot | cash_snapshots | 146-155 | dashboard.py | masterfile |
| 6 | CashForecastLine | cash_forecast_lines | 160-172 | financials.py | masterfile |
| 7 | PhaseSyncEntry | phase_sync_entries | 177-189 | No | masterfile |
| 8 | PayrollEntry | payroll_entries | 194-207 | No | masterfile |
| 9 | PayrollCalendar | payroll_calendar | 212-222 | team.py, dashboard.py | masterfile |
| 10 | PLEntry | pl_entries | 227-238 | financials.py | masterfile |
| 11 | Scenario | scenarios | 243-251 | No | masterfile |
| 12 | ScenarioAssumption | scenario_assumptions | 254-263 | No | masterfile |
| 13 | DataSource | data_sources | 268-277 | No | base.py |
| 14 | LienWaiver | lien_waivers | 282-294 | team.py, dashboard.py | masterfile |
| 15 | ProjectMilestone | project_milestones | 299-315 | projects.py | schedule.py |
| 16 | RetainageEntry | retainage_entries | 320-330 | financials.py, dashboard.py | masterfile |
| 17 | BidPipeline | bid_pipeline | 335-347 | crm.py, dashboard.py | masterfile |
| 18 | CrewAllocation | crew_allocations | 352-361 | team.py | masterfile |
| 19 | Lead | leads | 366-399 | crm.py | leads.py |
| 20 | LeadProposal | lead_proposals | 404-415 | crm.py | leads.py |
| 21 | BillingCustomer | billing_customers | 420-428 | billing.py | No |
| 22 | BillingSubscription | billing_subscriptions | 431-440 | billing.py | No |
| 23 | BillingEvent | billing_events | 443-451 | billing.py | No |
| 24 | UserAccount | user_accounts | 456-465 | auth.py | No |

---

### 3.3 API Endpoints

#### `backend/api/admin.py` (191 lines) — 7 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| POST | /admin/setup | 18-23 | Works |
| POST | /admin/reset | 27-36 | **CRITICAL: NO AUTH** |
| GET | /admin/status | 39-53 | Works |
| POST | /admin/import/masterfile | 78-99 | Works |
| POST | /admin/import/budgets | 102-127 | Works |
| POST | /admin/import/leads | 130-148 | Works |
| POST | /admin/import/proposals | 151-169 | Works |
| POST | /admin/import/jobs | 172-190 | Works |

**CRITICAL BUG**: `/admin/reset` (line 27) can drop ALL tables and recreate them. The only protection is a query param `?confirm=yes-delete-everything`. No authentication, no authorization. Anyone who discovers this endpoint can wipe the entire database.

#### `backend/api/auth.py` (172 lines) — 3 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| POST | /auth/signup | 118-137 | Works (if deps installed) |
| POST | /auth/login | 140-160 | Works (if deps installed) |
| GET | /auth/me | 163-171 | Works (if deps installed) |

- Well implemented: timing-safe password rejection (line 148-150), password strength validation (lines 39-46), bcrypt hashing
- **ISSUE** (lines 8-17): `jose` and `passlib` are imported with try/except — if not installed, auth silently fails at runtime rather than at startup
- **NOT WIRED**: No API endpoint besides `/auth/*` uses authentication. All other endpoints are fully public.

#### `backend/api/billing.py` (308 lines) — 5+ endpoints
- Stripe checkout session creation, customer portal, webhook handler
- 3 plans: Starter ($299/mo), Professional ($699/mo), Enterprise ($1,499/mo)
- **ISSUE**: No auth middleware — billing endpoints are public

#### `backend/api/dashboard.py` (212 lines) — 1 endpoint + alert generator

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| GET | /dashboard | 31-146 | Works but has logic bugs |

**BUGS**:
- **Line 45-47**: AP outstanding queries `Debt` table filtered by `DebtType.other` — this is not actual accounts payable. It's a meaningless proxy.
- **Line 49-51**: `remaining_draws = budget_total - contract_amount` — this calculates the wrong thing. Remaining draws should be `budget_total - total_drawn`, not budget minus contract.
- **Line 101-103**: `avg_percent_complete` is calculated as `total_released / total_budget * 100` — this is spending rate, not percent complete. Misleading label.

#### `backend/api/projects.py` (180 lines) — 8 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| GET | /projects | - | Works, paginated |
| GET | /projects/{id} | - | Works, joinedload |
| GET | /projects/{id}/costs | - | Works |
| GET | /projects/{id}/sov | - | Works |
| GET | /projects/{id}/draws | - | Works |
| GET | /projects/{id}/cos | - | Works |
| GET | /projects/{id}/milestones | - | Works |
| GET | /projects/{id}/quotes | - | Works |

**Cleanest router** — no bugs found.

#### `backend/api/financials.py` (204 lines) — 10 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| GET | /financials/debts | 36-46 | Works |
| GET | /financials/pl | 49-63 | **BUG**: year defaults to 2025 |
| GET | /financials/pl/summary | 66-99 | **BUG**: categorizes rev/exp by string matching |
| GET | /financials/ar | 102-115 | Works |
| GET | /financials/cash-forecast | 118-124 | Works |
| GET | /financials/cash-forecast/weekly | 127-143 | Works |
| GET | /financials/retainage | 146-150 | Works |
| GET | /financials/recurring | 153-163 | Works |
| GET | /financials/properties | 166-170 | Works |
| GET | /financials/transactions | 173-203 | Works |

**BUGS**:
- **Line 52**: P&L year defaults to 2025 instead of current year
- **Line 69**: Same — year defaults to 2025
- **Line 91**: Revenue/expense classification uses naive string matching (`"revenue" in acct_lower or "income" in acct_lower or amt > 0`). Positive expenses would be classified as revenue. Should use ChartOfAccounts.account_type.

#### `backend/api/crm.py` (146 lines) — 5 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| GET | /crm/leads | 25-51 | **CRASH BUG** |
| GET | /crm/proposals | 54-64 | **CRASH BUG** |
| GET | /crm/pipeline | 67-93 | Works |
| GET | /crm/pipeline/summary | 96-130 | Works |
| GET | /crm/leads/by-salesperson | 133-145 | **CRASH BUG** |

**CRASH BUGS**:
- **Line 50**: `LeadOut` schema references `estimated_value` but the `Lead` model (extended.py:387) has field `estimated_revenue`. Pydantic `model_validate` will serialize this as `None` instead of the actual value — data silently lost.
- **Line 63**: `LeadProposalOut` schema references `proposal_amount`, `sent_date`, `approved_date` but the `LeadProposal` model (extended.py:404-415) has `client_price` and NO date fields. This will crash or return null values.
- **Line 63**: Orders by `LeadProposal.proposal_amount` which **doesn't exist** on the model. This will throw `AttributeError` at runtime.
- **Line 139**: `Lead.estimated_value` doesn't exist — should be `Lead.estimated_revenue`. SQLAlchemy AttributeError at runtime.

#### `backend/api/team.py` (157 lines) — 5 endpoints

| Method | Path | Lines | Status |
|--------|------|-------|--------|
| GET | /team/employees | 27-37 | Works |
| GET | /team/payroll-calendar | 40-59 | Works |
| GET | /team/crew-allocation | 62-109 | **N+1 query bug** |
| GET | /team/lien-waivers | 112-118 | Works |
| GET | /team/lien-waivers/risk | 121-156 | **N+1 query bug** |

**BUGS**:
- **Line 101**: Inside a loop, `db.query(Project.code).filter(Project.id == a.project_id).first()` — N+1 query. Each crew allocation row triggers a separate DB query. With 100 allocations = 100 extra queries.
- **Line 129**: Same issue — `db.query(Vendor.name).filter(Vendor.id == vid).first()` inside a loop.

#### `backend/api/vendors.py` (77 lines) — 3 endpoints
- List, detail, scorecard with composite scoring
- **Clean** — no bugs found

---

### 3.4 Import Pipeline

#### `backend/importers/base.py` (200 lines)
- `BaseImporter` with `ImportResult` tracking
- Utilities: `clean_currency()`, `clean_string()`, `clean_int()`, `clean_date()`, `clean_bool()`
- `get_or_create_vendor()`, `get_or_create_project()`
- `log_data_source()`, `log_audit()`
- **ISSUE** (line 149-162): `log_audit()` method exists but is **never called** by any importer. No audit trail for imports.

#### `backend/importers/masterfile.py` (899 lines) — THE BIG ONE
- Imports 30 tabs from SECG Ultimate Masterfile XLSX
- Tabs: TXN LOG, DEBT SCHEDULE, PROPERTIES, PROJECT BUDGETS, JOB COSTING, SOV DRAW BUILDER, DRAW TRACKER, EMPLOYEE COSTS, PAYROLL, PAYROLL CALENDAR, DAILY INPUTS, CASH FLOW 13WK, PHASE SYNC, DEBT PAYOFF, RECURRING EXP, MONTHLY PL, MULTIFAMILY PL, SCENARIO MODEL, COA, DATA LOG, CHANGE ORDERS, LIEN WAIVERS, VENDOR SCORECARD, PROJECT SCHEDULE, RETAINAGE, BID PIPELINE, CREW ALLOCATION, AR AGING, AP AGING, LOWES PRO, VICTORY CROSSINGS
- **BUG**: P&L import hardcodes `period_year=2025` — will import next year's data as 2025
- **BUG**: AR aging import creates invoices with `project_id=None` when project code not found, violating the foreign key intent
- **BUG**: Payroll dates are partially hardcoded

#### `backend/importers/budgets.py` (362 lines)
- Imports construction loan budget CSVs (draw schedule format)
- Maps 6 filenames to project codes: WG1, WG2, WG3, KA1, KA2, RV1
- Creates: Project → CostCodes → SOVLines → PayApps
- Auto-categorizes cost codes into 10 categories
- **ISSUE**: PayAppLines are referenced in comments (line 265-267) but never actually created
- Generally well implemented

#### `backend/importers/jobs.py` (174 lines)
- Imports BuilderTrend open jobs XLSX
- Creates/updates Projects with BuilderTrend fields
- **Clean**

#### `backend/importers/leads.py` (198 lines)
- Two importers: `LeadsImporter` + `ProposalsImporter`
- Imports from BuilderTrend XLSX exports
- **Clean**

#### `backend/importers/schedule.py` (346 lines)
- Hardcoded schedule data parsed from a PDF
- Creates ProjectMilestones for Walnut Grove projects
- **BUG**: Year set inconsistently (hardcoded date ranges)

#### `backend/importers/orchestrator.py`
- Orchestrates running multiple importers
- **Clean**

---

### 3.5 Frontend Pages

#### `frontend/src/App.jsx` (33 lines)
- React Router with 8 routes: `/login`, `/`, `/projects`, `/projects/:id`, `/financials`, `/vendors`, `/crm`, `/team`, `/payments`
- Catch-all redirects to `/`
- **CRITICAL**: No route guards. No auth check. Any URL is accessible without login.

#### `frontend/src/pages/Login.jsx` (100 lines)
- **CRITICAL BUG** (line 16): `setTimeout(() => navigate('/'), 600)` — login form does NOT call any API. Does NOT check credentials. Just waits 600ms and redirects to dashboard. Any email/password (or blank) works.
- Beautiful UI with gold glow effect, eye toggle, "Keep me signed in" checkbox — all cosmetic, no functionality.

#### `frontend/src/pages/Dashboard.jsx` (142 lines)
- **PARTIALLY CONNECTED**: Calls `api.dashboard()` via `useApi` hook (line 54)
- Falls back to hardcoded demo values with `||` operator (lines 83-93): e.g., `cash.cash_on_hand || 277912`
- Charts (lines 99-122) **ALWAYS** use demo data arrays `demoProjects` and `demoCashFlow` — never call the API
- Alerts (line 61-66) fall back to hardcoded array if API doesn't return them

#### `frontend/src/pages/Projects.jsx` (107 lines)
- **PARTIALLY CONNECTED**: Calls `api.projects()` (line 14)
- Falls back to 6 hardcoded demo projects if API fails
- Search/filter works on whichever data source loads

#### `frontend/src/pages/ProjectDetail.jsx` (139 lines)
- 11 sub-tabs: Overview, Cost Codes, SOV, Pay Apps, Change Orders, Schedule, Bids & Quotes, Commitments, Actuals, Cashflow/WIP, What Changed
- **ALL TABS USE DEMO DATA** from `demoData.js` — zero API calls for any sub-tab
- The tab components receive hardcoded data as props

#### `frontend/src/pages/Financials.jsx` (161 lines)
- 6 tabs: Debts, Cash Forecast, Retainage, Recurring, Properties, Transactions
- **ALL DEMO DATA** — makes ZERO API calls
- `api.js` has all the methods (`api.debts()`, `api.cashForecast()`, etc.) but they're never called

#### `frontend/src/pages/Vendors.jsx` (112 lines)
- **PARTIALLY CONNECTED**: Calls `api.vendors()`
- Falls back to demo data

#### `frontend/src/pages/CRM.jsx` (112 lines)
- 3 tabs: Leads, Proposals, Pipeline
- **ALL DEMO DATA** — no API calls
- `api.js` has `api.leads()`, `api.proposals()`, `api.pipeline()` but never used

#### `frontend/src/pages/Team.jsx` (151 lines)
- 3 tabs: Employees, Payroll Calendar, Crew Deployment
- **ALL DEMO DATA** — no API calls

#### `frontend/src/pages/Payments.jsx` (228 lines)
- "Pay a Vendor" and "Request a Draw" forms
- **ALL DEMO DATA** — forms are non-functional
- "Send Payment" and "Submit Draw Request" buttons do nothing

#### `frontend/src/components/jobcosting/demoData.js` (600+ lines)
- Comprehensive demo data for ALL ProjectDetail tabs
- Phases, cost codes, line items, bids, commitments, SOV, pay apps, change orders, milestones, cashflow, WIP, changelog, decision queue
- This is what every ProjectDetail tab renders

#### `frontend/src/hooks/useApi.js` (42 lines)
- Generic fetch hook with loading/error/refetch
- **ISSUE**: Silently swallows errors — `catch(e) { setError(e.message) }` with no logging
- Only used by Dashboard, Projects, and Vendors pages

#### `frontend/src/lib/api.js` (86 lines)
- 30+ API methods correctly mapped to backend endpoints
- All methods exist and are correctly implemented
- **Problem**: Most are never actually called by any page component

---

## 4. Bug Registry

### CRITICAL (will crash or cause data loss)

| # | File:Line | Bug | Impact |
|---|-----------|-----|--------|
| C1 | admin.py:27 | `/admin/reset` has NO authentication | Anyone can wipe the database |
| C2 | Login.jsx:16 | Login is fake `setTimeout` redirect | Zero security, no auth |
| C3 | App.jsx:all | No route guards on any page | All pages accessible without login |
| C4 | crm.py:63 | `LeadProposal.proposal_amount` doesn't exist | AttributeError crash at runtime |
| C5 | crm.py:139 | `Lead.estimated_value` doesn't exist | AttributeError crash at runtime |
| C6 | schemas:303-308 | `LeadProposalOut.proposal_amount/sent_date/approved_date` don't match model fields | Schema validation returns nulls or crashes |

### HIGH (wrong data or security concern)

| # | File:Line | Bug | Impact |
|---|-----------|-----|--------|
| H1 | config.py:38 | CORS wildcard `https://*.up.railway.app` invalid | Railway deploys will have CORS errors |
| H2 | config.py:23 | Default secret key is public knowledge | JWT tokens forged if env var not set |
| H3 | dashboard.py:45-47 | AP = Debt(type=other) not actual payables | Dashboard shows wrong AP number |
| H4 | dashboard.py:49-51 | remaining_draws = budget - contract | Wrong calculation |
| H5 | dashboard.py:101-103 | avg_percent_complete = spending rate | Misleading metric |
| H6 | financials.py:52,69 | P&L year defaults to 2025 | 2026 data won't show up by default |
| H7 | financials.py:91 | Revenue classified by string matching | Positive expenses counted as revenue |
| H8 | auth.py:8-17 | jose/passlib imported with try/except | Silent auth failure if deps missing |

### MEDIUM (functionality gaps)

| # | File:Line | Bug | Impact |
|---|-----------|-----|--------|
| M1 | team.py:101 | N+1 query in crew allocation | Performance degrades with data |
| M2 | team.py:129 | N+1 query in lien waiver risk | Same |
| M3 | base.py:149 | log_audit() exists but never called | No audit trail for imports |
| M4 | Dashboard.jsx:83-93 | KPI cards use `||` fallback to demo numbers | Real data hidden behind fake numbers |
| M5 | Dashboard.jsx:100 | Charts always use demo arrays | Never show real project/cashflow data |
| M6 | masterfile.py | P&L year hardcoded to 2025 | Same as H6, at import level |
| M7 | budgets.py:265-267 | PayAppLines referenced but never created | Incomplete draw detail |

### LOW (cosmetic / tech debt)

| # | File:Line | Bug | Impact |
|---|-----------|-----|--------|
| L1 | core.py:295-306 | Contract model is orphaned | Dead code |
| L2 | core.py:494-502 | InvoiceLine model is orphaned | Dead code |
| L3 | core.py:507-520 | Payment model is orphaned | Dead code |
| L4 | core.py:525-554 | Document/Version/Link orphaned | Dead code |
| L5 | core.py:559-571 | WorkflowTask model is orphaned | Dead code |
| L6 | useApi.js | Errors silently swallowed | Hard to debug failures |
| L7 | billing.py | No auth on billing endpoints | Should require login |

---

## 5. Frontend ↔ Backend Integration Matrix

| Page | API Methods Available | Actually Called? | Data Source |
|------|----------------------|-----------------|-------------|
| Dashboard | `api.dashboard()` | YES | API with demo fallback |
| Projects (list) | `api.projects()` | YES | API with demo fallback |
| Project Detail | `api.project()`, `api.projectCosts()`, `api.projectSOV()`, `api.projectDraws()`, `api.projectCOs()`, `api.projectMilestones()` | **NO** | 100% demoData.js |
| Financials | `api.debts()`, `api.pl()`, `api.cashForecast()`, `api.retainage()`, `api.recurring()`, `api.properties()`, `api.transactions()` | **NO** | 100% hardcoded |
| Vendors | `api.vendors()`, `api.vendor()`, `api.vendorScorecard()` | YES (list only) | API with demo fallback |
| CRM | `api.leads()`, `api.proposals()`, `api.pipeline()`, `api.pipelineSummary()` | **NO** | 100% hardcoded |
| Team | `api.employees()`, `api.payrollCalendar()`, `api.crewAllocation()`, `api.lienWaivers()` | **NO** | 100% hardcoded |
| Payments | None defined for forms | **NO** | 100% hardcoded, forms non-functional |

**Summary**: 3 of 9 pages partially connected. 0 pages fully connected. 6 pages entirely on demo data.

---

## 6. What Works Today

1. **Backend import pipeline** — masterfile XLSX with 30+ tabs, 6 budget CSVs, BuilderTrend leads/proposals/jobs
2. **Database schema** — 45+ tables, proper foreign keys, comprehensive enums
3. **API endpoints** — 30+ endpoints, mostly correct (except CRM crashes)
4. **Dashboard KPIs** — partially working with real aggregated data from the database
5. **Projects list** — fetches real project data
6. **Vendors list** — fetches real vendor data
7. **Stripe billing** — checkout, portal, webhook all implemented
8. **Auth backend** — JWT with bcrypt, signup/login/me endpoints
9. **UI design** — dark theme, responsive layout, consistent component library

---

## 7. What Does NOT Work

1. **Login** — completely fake, redirects after 600ms regardless of input
2. **Route protection** — every page accessible without auth
3. **Project detail** — 11 tabs, all on demo data, zero API calls
4. **Financials** — 6 tabs, all on demo data, zero API calls
5. **CRM** — 3 tabs, all on demo data, API endpoints crash anyway
6. **Team** — 3 tabs, all on demo data
7. **Payments** — forms are non-functional
8. **Admin reset** — publicly accessible database wipe
9. **Dashboard charts** — always show fake data
10. **KPI cards** — show demo numbers when API returns 0 or null

---

## 8. Lines of Code Summary

| Area | Files | Lines (approx) |
|------|-------|----------------|
| Backend models | 2 | 1,056 |
| Backend API | 9 | 1,547 |
| Backend importers | 7 | 2,179 |
| Backend core | 4 | 161 |
| Frontend pages | 9 | 1,293 |
| Frontend components | 15+ | 1,800+ |
| Frontend lib/hooks | 4 | 250+ |
| Config/Docker | 5 | 100+ |
| **Total** | **~55** | **~8,400** |

---

## 9. Readiness Verdict

**NOT READY FOR PRODUCTION.**

The backend is roughly 75% complete — it has a solid data model and import pipeline, but API bugs (CRM crashes, wrong calculations) and security holes (no auth enforcement) block deployment.

The frontend is roughly 30% complete in terms of real functionality — it looks polished but almost every page displays hardcoded demo data instead of real API data. The authentication system is completely disconnected.

To reach a **Minimum Viable Product**, the following must happen (in priority order):
1. Wire frontend login to backend auth
2. Add route guards
3. Fix CRM schema/model mismatches
4. Connect all frontend pages to their existing API endpoints
5. Add auth middleware to admin and billing endpoints
6. Fix dashboard calculation bugs
7. Fix CORS for Railway deployment
8. Update hardcoded year references from 2025 to dynamic
