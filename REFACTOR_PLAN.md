# SECG ERP — Refactor & Implementation Plan

**Date**: 2026-02-21
**Reference**: CURRENT_STATE_AUDIT.md, GAP_ANALYSIS.md

This is the execution plan. Each phase has explicit deliverables, exact files to modify, and acceptance criteria.

---

## Phase 0: Emergency Fixes (Day 1 — ~9 hours)

These must be done before showing the app to anyone.

### 0.1 Fix CRM Crash Bugs

**Files to modify:**
- `backend/schemas/__init__.py`
- `backend/api/crm.py`

**Changes:**
1. `schemas/__init__.py` — Fix `LeadProposalOut`:
   - Rename `proposal_amount` → `client_price`
   - Remove `sent_date` and `approved_date` (don't exist on model)
   - Add `opportunity_title` and `client_contact` (exist on model)

2. `schemas/__init__.py` — Fix `LeadOut`:
   - Rename `estimated_value` → `estimated_revenue`

3. `crm.py:63` — Change `LeadProposal.proposal_amount` → `LeadProposal.client_price`

4. `crm.py:139` — Change `Lead.estimated_value` → `Lead.estimated_revenue`

**Acceptance**: `GET /api/crm/leads`, `GET /api/crm/proposals`, `GET /api/crm/leads/by-salesperson` all return 200 with correct data.

### 0.2 Wire Frontend Authentication

**Files to modify:**
- `frontend/src/lib/api.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/App.jsx`
- NEW: `frontend/src/contexts/AuthContext.jsx`

**Changes:**
1. Create `AuthContext.jsx`:
   - Store JWT token in localStorage
   - Provide `login()`, `logout()`, `user` via React context
   - On mount, check for existing token and call `GET /api/auth/me`

2. Update `api.js`:
   - Add `getToken()` helper that reads from localStorage
   - Include `Authorization: Bearer ${token}` in all requests
   - On 401 response, clear token and redirect to `/login`

3. Rewrite `Login.jsx`:
   - Call `POST /api/auth/login` with form data
   - Handle errors (show error message)
   - On success, store token and redirect to `/`

4. Update `App.jsx`:
   - Wrap routes in `AuthProvider`
   - Add `ProtectedRoute` component that checks auth context
   - Redirect unauthenticated users to `/login`

**Acceptance**: Cannot access any page without logging in. Login with valid credentials works. Invalid credentials show error.

### 0.3 Protect Admin Endpoints

**Files to modify:**
- `backend/api/admin.py`
- `backend/api/auth.py` (extract `get_current_user` dependency)

**Changes:**
1. Extract `get_current_user` from `auth.py` as a reusable FastAPI dependency
2. Add `Depends(get_current_user)` to all `/admin/*` endpoints
3. Add admin role check to `/admin/reset`

**Acceptance**: `/admin/reset` returns 401 without auth, 403 without admin role.

### 0.4 Fix CORS Configuration

**Files to modify:**
- `backend/core/config.py`

**Changes:**
1. Replace `https://*.up.railway.app` with the actual Railway deployment URL (from env var `RAILWAY_PUBLIC_DOMAIN`)
2. Add env var `CORS_ORIGINS` to `.env.example`

**Acceptance**: Frontend deployed on Railway can make API calls without CORS errors.

### 0.5 Fix Secret Key

**Files to modify:**
- `backend/core/config.py`

**Changes:**
1. In `__post_init__`, if not DEBUG and `secret_key == "dev-secret-change-in-production"`, raise `RuntimeError`

**Acceptance**: App refuses to start in production without a real secret key.

---

## Phase 1: Frontend Data Integration (Week 1-2 — ~32 hours)

Connect every page to its existing backend API. The APIs already exist — the frontend just isn't calling them.

### 1.1 Dashboard — Remove Demo Fallbacks

**Files to modify:**
- `frontend/src/pages/Dashboard.jsx`

**Changes:**
1. Remove `demoProjects` and `demoCashFlow` constant arrays
2. Add `useApi` calls for `api.cashForecastWeekly()` and project budget data
3. Replace `||` fallbacks with proper null/loading handling
4. Wire chart data to API responses
5. Show "No data" state when API returns empty

**Acceptance**: Dashboard shows real data from database. Charts reflect actual cashflow/project data. No hardcoded numbers visible.

### 1.2 ProjectDetail — Wire All 11 Tabs

**Files to modify:**
- `frontend/src/pages/ProjectDetail.jsx`
- All files in `frontend/src/components/jobcosting/`

**Changes:**
1. `ProjectDetail.jsx`: Call `api.project(id)` for overview data
2. `CostCodesTab.jsx`: Call `api.projectCosts(id)`
3. `SOVTab.jsx`: Call `api.projectSOV(id)`
4. `PayAppsTab.jsx`: Call `api.projectDraws(id)`
5. `ChangeOrdersTab.jsx`: Call `api.projectCOs(id)`
6. `ScheduleTab.jsx`: Call `api.projectMilestones(id)`
7. For remaining tabs (Bids & Quotes, Commitments, Actuals, Cashflow/WIP, What Changed) — create backend endpoints if missing, or show "Coming soon" state
8. Remove import of `demoData.js` from all tabs

**Acceptance**: Each tab shows real project data. Loading states shown while fetching. Error states shown on failure. demoData.js is no longer imported.

### 1.3 Financials — Wire All 6 Tabs

**Files to modify:**
- `frontend/src/pages/Financials.jsx`

**Changes:**
1. Add `useApi` hooks for each tab:
   - Debts tab: `api.debts()`
   - Cash Forecast: `api.cashForecastWeekly()`
   - Retainage: `api.retainage()`
   - Recurring: `api.recurring()`
   - Properties: `api.properties()`
   - Transactions: `api.transactions()`
2. Replace hardcoded data arrays with API responses
3. Add loading/error states per tab

**Acceptance**: All 6 financial tabs show real data from the database.

### 1.4 CRM — Wire All 3 Tabs

**Files to modify:**
- `frontend/src/pages/CRM.jsx`

**Changes:**
1. Leads tab: `api.leads()`
2. Proposals tab: `api.proposals()`
3. Pipeline tab: `api.pipeline()` + `api.pipelineSummary()` for chart
4. Replace hardcoded data
5. Add search/filter for leads

**Acceptance**: CRM tabs show real lead and pipeline data. (Requires Phase 0.1 bug fixes first.)

### 1.5 Team — Wire All 3 Tabs

**Files to modify:**
- `frontend/src/pages/Team.jsx`

**Changes:**
1. Employees tab: `api.employees()`
2. Payroll Calendar: `api.payrollCalendar()`
3. Crew Deployment: `api.crewAllocation()`
4. Replace hardcoded data

**Acceptance**: Team tabs show real employee, payroll, and crew data.

### 1.6 Vendors — Complete Integration

**Files to modify:**
- `frontend/src/pages/Vendors.jsx`

**Changes:**
1. Already partially wired — ensure detail view calls `api.vendor(id)`
2. Add scorecard view with `api.vendorScorecard()`

**Acceptance**: Vendor list and detail show real data, scorecard displays composite scores.

---

## Phase 2: Backend Bug Fixes (Week 1, parallel — ~6 hours)

### 2.1 Fix Dashboard Calculations

**Files to modify:**
- `backend/api/dashboard.py`

**Changes:**
1. **AP calculation** (line 45-47): Replace Debt query with actual accounts payable logic. Options:
   - Query `CostEvent` for unpaid vendor bills
   - Or create a proper AP view from Commitments minus Payments

2. **Remaining draws** (line 49-51): Change to `budget_total - SUM(pay_apps.amount_approved)` for active projects

3. **Avg percent complete** (line 101-103): Calculate from `AVG(sov_lines.percent_complete)` per project, then average across projects

**Acceptance**: Dashboard numbers match manual calculations from imported data.

### 2.2 Fix P&L Defaults

**Files to modify:**
- `backend/api/financials.py`
- `backend/importers/masterfile.py`

**Changes:**
1. `financials.py:52`: Change `year: int = Query(default=2025)` → `default=None` and use `datetime.now().year` if None
2. `financials.py:69`: Same
3. `masterfile.py`: Find P&L year hardcoding and make dynamic

**Acceptance**: P&L endpoints return current year data by default.

### 2.3 Fix P&L Revenue Classification

**Files to modify:**
- `backend/api/financials.py`

**Changes:**
1. `financials.py:91`: Instead of string matching account names, join to `ChartOfAccounts` table and use `account_type` field
2. Accounts with `account_type = "Revenue"` are revenue, `account_type = "Expense"` are expenses

**Acceptance**: P&L summary correctly categorizes all accounts.

### 2.4 Fix N+1 Queries

**Files to modify:**
- `backend/api/team.py`

**Changes:**
1. `team.py:62-109`: Use `joinedload` or a single prefetch query for Projects instead of per-row queries
2. `team.py:121-156`: Use `joinedload` or a single prefetch for Vendor names

**Acceptance**: Crew allocation and lien waiver risk endpoints use ≤3 SQL queries regardless of data size.

---

## Phase 3: CRUD Endpoints (Week 2-3 — ~30 hours)

### 3.1 Create Auth Dependency

**Files to create/modify:**
- `backend/core/auth.py` (NEW — extracted from `api/auth.py`)

**Deliverables:**
- `get_current_user` FastAPI dependency
- `require_role(role: str)` dependency factory
- Apply to all new and existing endpoints

### 3.2 Project CRUD

**Files to modify:**
- `backend/api/projects.py`
- `backend/schemas/__init__.py`

**New endpoints:**
- `POST /api/projects` — create project
- `PUT /api/projects/{id}` — update project
- `PATCH /api/projects/{id}/status` — change status
- `POST /api/projects/{id}/cost-codes` — add cost code
- `PUT /api/projects/{id}/cost-codes/{cc_id}` — update cost code

**New schemas:**
- `ProjectCreateIn`, `ProjectUpdateIn`, `CostCodeCreateIn`

### 3.3 Vendor CRUD

**Files to modify:**
- `backend/api/vendors.py`
- `backend/schemas/__init__.py`

**New endpoints:**
- `POST /api/vendors` — create vendor
- `PUT /api/vendors/{id}` — update vendor
- `PUT /api/vendors/{id}/scores` — update scorecard

### 3.4 Change Order CRUD

**Files to modify:**
- `backend/api/projects.py`
- `backend/schemas/__init__.py`

**New endpoints:**
- `POST /api/projects/{id}/cos` — create change order
- `PUT /api/projects/{pid}/cos/{co_id}` — update
- `PATCH /api/projects/{pid}/cos/{co_id}/approve` — approve
- `PATCH /api/projects/{pid}/cos/{co_id}/reject` — reject

### 3.5 Pay Application CRUD

**Files to modify:**
- `backend/api/projects.py`
- `backend/schemas/__init__.py`

**New endpoints:**
- `POST /api/projects/{id}/draws` — create pay app
- `PUT /api/projects/{pid}/draws/{pa_id}` — update
- `PATCH /api/projects/{pid}/draws/{pa_id}/submit` — submit for approval
- `PATCH /api/projects/{pid}/draws/{pa_id}/approve` — approve
- `POST /api/projects/{pid}/draws/{pa_id}/lines` — add line items

### 3.6 Invoice CRUD

**Files to modify:**
- `backend/api/financials.py`
- `backend/schemas/__init__.py`

**New endpoints:**
- `POST /api/financials/invoices` — create invoice
- `PUT /api/financials/invoices/{id}` — update
- `POST /api/financials/invoices/{id}/payment` — record payment

### 3.7 Cost Event CRUD

**Files to modify:**
- `backend/api/financials.py`

**New endpoints:**
- `POST /api/financials/transactions` — create cost event
- `PUT /api/financials/transactions/{id}` — update
- `DELETE /api/financials/transactions/{id}` — delete (soft)

### 3.8 Payments Page Backend

**Files to create:**
- `backend/api/payments.py` (NEW)

**New endpoints:**
- `POST /api/payments/vendor` — send vendor payment
- `POST /api/payments/draw-request` — submit draw request
- `GET /api/payments/history` — payment history

**Wire to frontend:**
- `frontend/src/pages/Payments.jsx` — connect forms to new endpoints

---

## Phase 4: Testing & Migrations (Week 2, parallel — ~24 hours)

### 4.1 Set Up Alembic

**Files to create:**
- `alembic.ini`
- `alembic/env.py`
- `alembic/versions/0001_initial.py` (auto-generated from current models)

**Changes:**
1. `pip install alembic` (add to requirements.txt)
2. `alembic init alembic`
3. Configure `env.py` to use `backend.core.database`
4. Generate initial migration from existing models
5. Remove `Base.metadata.create_all()` from `main.py` and `admin.py`

**Acceptance**: `alembic upgrade head` creates all tables. `alembic revision --autogenerate` detects schema changes.

### 4.2 Write Critical Tests

**Files to create:**
- `tests/conftest.py` — test database fixtures
- `tests/test_auth.py` — signup, login, token validation
- `tests/test_projects.py` — CRUD + list
- `tests/test_dashboard.py` — KPI calculations
- `tests/test_crm.py` — leads, proposals (especially the fixed schemas)
- `tests/test_importers.py` — masterfile import with sample data

**Test stack**: pytest + httpx (for async FastAPI testing)

**Acceptance**: `pytest` passes with >80% coverage on API endpoints.

### 4.3 CI/CD Pipeline

**Files to create:**
- `.github/workflows/ci.yml`

**Pipeline:**
1. Lint (ruff or flake8)
2. Type check (mypy, optional)
3. Test (pytest with PostgreSQL service container)
4. Build Docker image
5. Deploy (Railway or Render webhook)

---

## Phase 5: Reporting & Analytics (Week 3-4 — ~20 hours)

### 5.1 WIP Schedule Report

**Files to create:**
- `backend/api/reports.py` (NEW)

**Endpoint**: `GET /api/reports/wip`
**Logic**: For each active project:
- Contract value
- Costs to date (from cost_events)
- Estimated cost at completion
- % Complete (cost method)
- Earned revenue
- Billed to date (from pay_apps)
- Over/under billing

### 5.2 Job Costing Report

**Endpoint**: `GET /api/reports/job-cost/{project_id}`
**Logic**: Per cost code: budget → committed → actual → forecast → variance

### 5.3 Cash Flow Projection

**Endpoint**: `GET /api/reports/cash-projection`
**Logic**: Current balance + scheduled draws - scheduled payables - recurring expenses, by week

### 5.4 Project Profitability

**Endpoint**: `GET /api/reports/profitability`
**Logic**: Contract amount - total costs = profit per project

---

## Phase 6: AIA Document Generation (Week 4 — ~16 hours)

### 6.1 G702 Application for Payment

**Files to create:**
- `backend/services/aia_generator.py`
- Template files for PDF generation

**Dependencies**: reportlab or weasyprint

**Logic**: Generate AIA G702 from PayApp + SOVLines

### 6.2 G703 Continuation Sheet

**Logic**: Generate G703 from PayAppLines with previous/current/stored/retainage columns

---

## Execution Timeline

```
Week 1:  Phase 0 (emergency fixes) + Phase 1.1-1.3 (dashboard, projects, financials)
         Phase 2 (backend bug fixes — parallel)
Week 2:  Phase 1.4-1.6 (CRM, team, vendors) + Phase 3.1-3.4 (auth dep, project/vendor/CO CRUD)
         Phase 4.1-4.2 (Alembic + tests — parallel)
Week 3:  Phase 3.5-3.8 (pay app, invoice, cost event, payments CRUD)
         Phase 4.3 (CI/CD) + Phase 5.1-5.2 (WIP, job costing reports)
Week 4:  Phase 5.3-5.4 (cash flow, profitability reports) + Phase 6 (AIA docs)
```

---

## File Change Summary

### Files to Create
| File | Phase | Purpose |
|------|-------|---------|
| `frontend/src/contexts/AuthContext.jsx` | 0.2 | Auth state management |
| `backend/core/auth.py` | 3.1 | Reusable auth dependencies |
| `backend/api/payments.py` | 3.8 | Payment endpoints |
| `backend/api/reports.py` | 5.1 | Reporting endpoints |
| `backend/services/aia_generator.py` | 6.1 | PDF generation |
| `tests/conftest.py` | 4.2 | Test fixtures |
| `tests/test_*.py` (5 files) | 4.2 | Test suites |
| `alembic/` (directory) | 4.1 | Database migrations |
| `.github/workflows/ci.yml` | 4.3 | CI/CD pipeline |

### Files to Modify
| File | Phases | Key Changes |
|------|--------|-------------|
| `backend/schemas/__init__.py` | 0.1, 3.x | Fix schemas + add create/update schemas |
| `backend/api/crm.py` | 0.1 | Fix field references |
| `frontend/src/pages/Login.jsx` | 0.2 | Real auth call |
| `frontend/src/App.jsx` | 0.2 | Auth provider + route guards |
| `frontend/src/lib/api.js` | 0.2 | Add auth headers |
| `backend/api/admin.py` | 0.3 | Add auth dependency |
| `backend/core/config.py` | 0.4, 0.5 | CORS fix + secret key validation |
| `frontend/src/pages/Dashboard.jsx` | 1.1 | Remove all demo data |
| `frontend/src/pages/ProjectDetail.jsx` | 1.2 | Wire to API |
| `frontend/src/pages/Financials.jsx` | 1.3 | Wire to API |
| `frontend/src/pages/CRM.jsx` | 1.4 | Wire to API |
| `frontend/src/pages/Team.jsx` | 1.5 | Wire to API |
| `frontend/src/pages/Vendors.jsx` | 1.6 | Complete integration |
| `frontend/src/pages/Payments.jsx` | 3.8 | Wire forms to API |
| `backend/api/dashboard.py` | 2.1 | Fix calculations |
| `backend/api/financials.py` | 2.2, 2.3, 3.6, 3.7 | Fix defaults + add CRUD |
| `backend/api/team.py` | 2.4 | Fix N+1 queries |
| `backend/api/projects.py` | 3.2, 3.4, 3.5 | Add CRUD endpoints |
| `backend/api/vendors.py` | 3.3 | Add CRUD endpoints |
| All jobcosting components | 1.2 | Remove demoData.js dependency |

### Files to Delete
| File | Phase | Reason |
|------|-------|--------|
| `frontend/src/components/jobcosting/demoData.js` | 1.2 | Replace with real API data |

---

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Masterfile XLSX format changes | Version the expected tab names; fail gracefully on missing tabs (already handled) |
| QuickBooks API rate limits | Queue-based sync with exponential backoff |
| Large data volumes (3000+ txns) | Already using pagination; add DB indexes on hot columns |
| Competitor launches first | Prioritize P0+P1 for demo-ready product in 1-2 weeks |
| Single developer bottleneck | AI-assisted development can parallelize backend + frontend |
| No tests = regression fear | Phase 4 runs parallel; write tests for every new feature |

---

## Definition of Done — MVP

The app is MVP-ready when:

1. Login works with real credentials
2. Unauthorized users cannot access any page or API
3. All 9 pages display real data from the database (no demo data visible)
4. User can create and update projects, vendors, cost codes, change orders
5. User can create and submit pay applications
6. Dashboard KPIs are mathematically correct
7. CRM endpoints work without crashing
8. At least 20 critical-path tests pass
9. Database uses Alembic migrations (no `create_all`)
10. Deployed and accessible on Railway/Render with proper CORS and HTTPS
