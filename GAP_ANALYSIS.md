# SECG ERP — Gap Analysis

**Date**: 2026-02-21
**Reference**: CURRENT_STATE_AUDIT.md

This document maps every gap between what exists today and what a production-ready construction ERP needs.

---

## 1. Authentication & Authorization

### Current State
- Backend has working JWT auth (`auth.py`): signup, login, `/me` endpoint
- Frontend login page (`Login.jsx:16`) does `setTimeout(() => navigate('/'), 600)` — no API call
- No route guards in `App.jsx`
- No API endpoint (except `/auth/*`) requires authentication
- No role-based access control (RBAC)
- No multi-tenancy / org isolation

### Gaps

| Gap | Severity | Effort |
|-----|----------|--------|
| Frontend login must call `POST /auth/login` and store JWT | CRITICAL | 2 hrs |
| Add `ProtectedRoute` wrapper to `App.jsx` | CRITICAL | 1 hr |
| Add `Authorization: Bearer` header to all API calls in `api.js` | CRITICAL | 1 hr |
| Create `useAuth` hook / React context for user state | CRITICAL | 2 hrs |
| Add `Depends(get_current_user)` to all API routers | CRITICAL | 4 hrs |
| Protect `/admin/reset` and `/admin/import/*` with admin-only role | CRITICAL | 1 hr |
| Protect billing endpoints with auth | HIGH | 1 hr |
| Add role-based access (admin, PM, accountant, field) | HIGH | 8 hrs |
| Add org/tenant isolation for multi-client SaaS | MEDIUM | 16 hrs |
| Session refresh / token rotation | LOW | 4 hrs |

**Total estimated effort**: ~40 hours

---

## 2. Frontend Data Integration

### Current State
- `api.js` has 30+ correctly mapped API methods
- Only 3 pages (Dashboard, Projects list, Vendors list) call the API at all
- 6 pages are 100% hardcoded demo data
- Dashboard charts always use demo data arrays
- KPI cards use `||` fallback that masks real zero values

### Gaps

| Page | What Needs Wiring | Severity | Effort |
|------|-------------------|----------|--------|
| **Login.jsx** | Call `api.login()`, store JWT, handle errors | CRITICAL | 2 hrs |
| **ProjectDetail.jsx** | Call `api.project(id)` + 6 sub-endpoints for tabs | CRITICAL | 6 hrs |
| **Financials.jsx** | Wire all 6 tabs to existing API methods | CRITICAL | 4 hrs |
| **CRM.jsx** | Wire 3 tabs (after fixing backend crashes) | HIGH | 3 hrs |
| **Team.jsx** | Wire 3 tabs to existing API methods | HIGH | 3 hrs |
| **Payments.jsx** | Create POST endpoints, wire forms | HIGH | 8 hrs |
| **Dashboard.jsx** | Remove demo fallbacks, wire charts to API data | HIGH | 3 hrs |
| **Dashboard.jsx** | Replace `demoProjects`/`demoCashFlow` with API data | MEDIUM | 2 hrs |
| **ProjectDetail.jsx** | Remove `demoData.js` dependency | MEDIUM | 1 hr |

**Total estimated effort**: ~32 hours

---

## 3. Backend Bug Fixes

### Schema/Model Mismatches (CRASH BUGS)

| Bug | File | Fix Required | Effort |
|-----|------|-------------|--------|
| `LeadProposalOut.proposal_amount` → should be `client_price` | schemas/__init__.py:304 | Rename field or add alias | 15 min |
| `LeadProposalOut.sent_date` → doesn't exist on model | schemas/__init__.py:307 | Remove or add field to model | 15 min |
| `LeadProposalOut.approved_date` → doesn't exist on model | schemas/__init__.py:308 | Remove or add field to model | 15 min |
| `LeadOut.estimated_value` → should be `estimated_revenue` | schemas/__init__.py:298 | Rename field or add alias | 15 min |
| `crm.py:63` orders by nonexistent `proposal_amount` | crm.py:63 | Change to `client_price` | 5 min |
| `crm.py:139` queries nonexistent `Lead.estimated_value` | crm.py:139 | Change to `estimated_revenue` | 5 min |

### Dashboard Calculation Errors

| Bug | File | Fix Required | Effort |
|-----|------|-------------|--------|
| AP = Debt(type=other) | dashboard.py:45-47 | Query actual AP (invoices payable or create AP model) | 2 hrs |
| remaining_draws = budget - contract | dashboard.py:49-51 | Use `budget_total - SUM(payapp.amount_approved)` | 30 min |
| avg_percent_complete = spending rate | dashboard.py:101-103 | Use actual SOVLine percent_complete avg | 30 min |

### Configuration Bugs

| Bug | File | Fix Required | Effort |
|-----|------|-------------|--------|
| CORS wildcard pattern invalid | config.py:38 | Use explicit Railway URL or use `allow_origins=["*"]` for dev | 15 min |
| Secret key has public default | config.py:23 | Fail loudly if SECRET_KEY not set in production | 15 min |
| P&L year hardcoded to 2025 | financials.py:52,69 | Use `datetime.now().year` as default | 5 min |
| P&L revenue classification | financials.py:91 | Join to ChartOfAccounts.account_type | 1 hr |

### Performance Issues

| Bug | File | Fix Required | Effort |
|-----|------|-------------|--------|
| N+1 query in crew allocation | team.py:101 | Joinedload or subquery | 30 min |
| N+1 query in lien waiver risk | team.py:129 | Joinedload or subquery | 30 min |

**Total backend fix effort**: ~6 hours

---

## 4. Missing CRUD Operations

### Current State
All endpoints are **read-only** (GET). There are zero POST/PUT/DELETE endpoints for business data (only admin imports).

### Gaps

| Entity | Operations Needed | Priority | Effort |
|--------|------------------|----------|--------|
| Projects | Create, Update, Archive | HIGH | 4 hrs |
| Cost Codes | Create, Update, Delete | HIGH | 3 hrs |
| Vendors | Create, Update, Archive | HIGH | 3 hrs |
| Change Orders | Create, Update, Approve/Reject | HIGH | 4 hrs |
| Pay Applications | Create, Submit, Approve, Mark Paid | CRITICAL | 6 hrs |
| Invoices | Create, Send, Record Payment | HIGH | 4 hrs |
| Cost Events | Create, Update, Delete | HIGH | 3 hrs |
| Commitments | Create, Update, Execute | MEDIUM | 3 hrs |
| Employees | Create, Update, Deactivate | MEDIUM | 2 hrs |
| Leads | Create, Update, Convert to Project | MEDIUM | 3 hrs |
| Lien Waivers | Create, Upload, Update status | MEDIUM | 2 hrs |
| Documents | Upload, Link to entities, Download | LOW | 8 hrs |
| Workflow Tasks | Create, Approve/Reject, Escalate | LOW | 6 hrs |

**Total estimated effort**: ~51 hours

---

## 5. Missing API Features

### Reporting & Analytics
| Feature | Description | Effort |
|---------|-------------|--------|
| WIP Report | Work-in-Progress schedule (earned revenue vs billed vs costs) | 8 hrs |
| Job Costing Report | Budget vs actual vs committed by cost code | 4 hrs |
| Cash Flow Projection | Based on scheduled draws, payables, and recurring | 6 hrs |
| Variance Analysis | Cost code variance with drill-down | 4 hrs |
| Aging Reports | AR/AP aging buckets (Current, 30, 60, 90+) | 3 hrs |
| Project Profitability | Revenue, costs, margin by project | 3 hrs |

### Search & Filtering
| Feature | Description | Effort |
|---------|-------------|--------|
| Global Search | Search across projects, vendors, invoices, cost events | 4 hrs |
| Advanced Filters | Multi-field filtering on all list endpoints | 4 hrs |
| Date Range Filters | Start/end date on all time-series data | 2 hrs |

### Notifications & Alerts
| Feature | Description | Effort |
|---------|-------------|--------|
| Email notifications | Overdue invoices, budget alerts, insurance expiry | 8 hrs |
| In-app notification center | Real-time alerts with read/dismiss | 6 hrs |
| Webhook integrations | Notify external systems on key events | 4 hrs |

**Total estimated effort**: ~56 hours

---

## 6. Data Pipeline Gaps

### Current State
- Masterfile importer handles 30 tabs — comprehensive
- Budget CSV importer handles 6 project files — good
- BuilderTrend leads/proposals/jobs importers — good
- Schedule importer — hardcoded data, not a real importer

### Gaps

| Gap | Description | Effort |
|-----|-------------|--------|
| QuickBooks Online sync | Real-time or scheduled sync (using QBO API) | 40 hrs |
| Ramp credit card import | Parse Ramp CSV/API for cost events | 8 hrs |
| Home Depot Pro import | Parse HD Pro invoices | 6 hrs |
| Lowe's Pro import | Parse Lowe's Pro exports | 6 hrs |
| Bank statement import | OFX/CSV import for bank reconciliation | 8 hrs |
| Re-import / delta detection | Track what changed since last import | 8 hrs |
| Conflict resolution UI | Show user conflicts when re-importing | 12 hrs |
| Scheduled auto-import | Cron or background worker for periodic imports | 4 hrs |

**Total estimated effort**: ~92 hours

---

## 7. Deployment & DevOps Gaps

### Current State
- Dockerfile (6 lines, Python only, no frontend build)
- docker-compose.yml (PostgreSQL 16 + Redis 7)
- Procfile for Railway
- No CI/CD pipeline
- No tests
- No database migrations (uses `create_all`)

### Gaps

| Gap | Description | Severity | Effort |
|-----|-------------|----------|--------|
| **Zero tests** | No unit tests, no integration tests, no e2e tests | CRITICAL | 40 hrs |
| **No migrations** | Using `create_all` — any schema change could lose data | CRITICAL | 8 hrs |
| **No CI/CD** | No automated testing, linting, or deployment pipeline | HIGH | 4 hrs |
| **No frontend build in Docker** | Dockerfile only installs Python deps | HIGH | 2 hrs |
| **No environment validation** | App starts with broken config silently | HIGH | 2 hrs |
| **No health check depth** | `/health` returns `{"status": "ok"}` without checking DB | MEDIUM | 1 hr |
| **No monitoring** | No error tracking (Sentry), no metrics, no logging infra | MEDIUM | 4 hrs |
| **No backup strategy** | No pg_dump, no point-in-time recovery | HIGH | 4 hrs |
| **Redis unused** | Configured in docker-compose but never referenced in code | LOW | 0 hrs (remove or use) |
| **No rate limiting** | All endpoints unlimited | MEDIUM | 2 hrs |
| **No HTTPS enforcement** | Relies on hosting provider | LOW | 1 hr |

**Total estimated effort**: ~68 hours

---

## 8. Frontend UX Gaps

### Current State
- 9 pages with consistent dark theme
- KPICard, LoadingState, Sidebar components
- Recharts for 2 dashboard charts
- No forms for data entry (only Login form which is fake)
- No modals, drawers, or detail panels

### Gaps

| Gap | Description | Effort |
|-----|-------------|--------|
| Form components (create/edit) | Projects, vendors, cost codes, invoices, etc. | 24 hrs |
| Validation and error handling | Form validation with error messages | 8 hrs |
| Table sorting and pagination | Proper sortable/paginated data tables | 8 hrs |
| File upload UI | For imports, documents, lien waivers | 6 hrs |
| Print/PDF generation | Pay apps (AIA G702/G703), invoices, reports | 12 hrs |
| Mobile responsiveness | Currently desktop-only layout | 8 hrs |
| Dark/light mode toggle | Only dark mode exists | 4 hrs |
| Toast notifications | Success/error feedback on actions | 2 hrs |
| Confirmation dialogs | For destructive actions (delete, archive) | 2 hrs |
| Empty states | When no data exists (just show blank currently) | 2 hrs |
| Loading skeletons | Replace spinner with content-shaped placeholders | 2 hrs |
| Keyboard shortcuts | For power users (Ctrl+K search, etc.) | 4 hrs |

**Total estimated effort**: ~82 hours

---

## 9. Business Logic Gaps

### Missing Construction-Specific Features

| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| AIA G702/G703 generation | Standard pay application forms | CRITICAL | 16 hrs |
| Retainage tracking | Automatic retainage on draws, release workflow | HIGH | 8 hrs |
| Lien waiver workflow | Request → receive → track by draw | HIGH | 8 hrs |
| Budget revision tracking | Track original → revised budget with CO links | HIGH | 6 hrs |
| Commitment management | PO/subcontract → change → billing → payment | HIGH | 12 hrs |
| Cost-to-complete forecasting | EAC/ETC calculations per cost code | MEDIUM | 8 hrs |
| WIP schedule | Over/under billing analysis | MEDIUM | 8 hrs |
| Punch list tracking | Project closeout deficiency tracking | LOW | 6 hrs |
| Warranty tracking | Post-completion warranty items | LOW | 4 hrs |
| Bid comparison matrix | Compare vendor bids side-by-side | LOW | 6 hrs |

**Total estimated effort**: ~82 hours

---

## 10. Gap Summary by Priority

### P0 — Must fix before any demo or deployment

| # | Gap | Effort |
|---|-----|--------|
| 1 | Wire frontend auth to backend JWT | 6 hrs |
| 2 | Add route guards | 1 hr |
| 3 | Fix CRM crash bugs (schema mismatches) | 1 hr |
| 4 | Protect `/admin/reset` with auth | 1 hr |
| 5 | Fix CORS for deployment | 15 min |
| **Subtotal** | | **~9 hrs** |

### P1 — Must complete for MVP

| # | Gap | Effort |
|---|-----|--------|
| 6 | Connect all frontend pages to existing APIs | 32 hrs |
| 7 | Fix dashboard calculation bugs | 3 hrs |
| 8 | Fix P&L year defaults | 20 min |
| 9 | Add auth to all API endpoints | 4 hrs |
| 10 | Create CRUD endpoints for key entities | 30 hrs |
| 11 | Add basic form components | 16 hrs |
| 12 | Set up Alembic migrations | 8 hrs |
| 13 | Write critical path tests | 16 hrs |
| **Subtotal** | | **~109 hrs** |

### P2 — Needed for production quality

| # | Gap | Effort |
|---|-----|--------|
| 14 | AIA G702/G703 PDF generation | 16 hrs |
| 15 | QuickBooks Online integration | 40 hrs |
| 16 | CI/CD pipeline | 4 hrs |
| 17 | Monitoring & error tracking | 4 hrs |
| 18 | Role-based access control | 8 hrs |
| 19 | Email notifications | 8 hrs |
| 20 | Reporting & analytics APIs | 28 hrs |
| **Subtotal** | | **~108 hrs** |

### P3 — Nice to have

| # | Gap | Effort |
|---|-----|--------|
| 21 | Multi-tenancy | 16 hrs |
| 22 | Additional data imports (Ramp, HD, Lowe's) | 20 hrs |
| 23 | Mobile responsiveness | 8 hrs |
| 24 | Advanced UX (keyboard shortcuts, dark/light toggle) | 10 hrs |
| **Subtotal** | | **~54 hrs** |

---

## 11. Total Effort Estimate

| Priority | Hours | Calendar (1 dev) |
|----------|-------|-----------------|
| P0 (Blockers) | ~9 hrs | 1 day |
| P1 (MVP) | ~109 hrs | 2-3 weeks |
| P2 (Production) | ~108 hrs | 2-3 weeks |
| P3 (Nice to have) | ~54 hrs | 1-2 weeks |
| **Total** | **~280 hrs** | **7-9 weeks** |

With focused AI-assisted development, P0+P1 could be compressed to **1-2 weeks**.
