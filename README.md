# SECG ERP — Construction Finance Platform

Backend API for Southeast Construction Group. Imports data from the masterfile, BuilderTrend, budget CSVs, and open jobs into a PostgreSQL database and serves it through a REST API.

## Quickest Path: Render (Free Tier)

### Step 1 — Push to GitHub

Create a new private repo and push this folder:

```bash
cd secg-erp
git init
git add .
git commit -m "initial"
gh repo create secg-erp --private --push
```

Or manually create a repo at github.com/new, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/secg-erp.git
git push -u origin main
```

### Step 2 — Deploy on Render

Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) and click **New Blueprint Instance**. Connect your GitHub repo. Render reads the `render.yaml` file and automatically creates:

- **Web Service** — Python, runs the FastAPI app
- **PostgreSQL Database** — free tier, auto-wired via `DATABASE_URL`

Click **Apply** and wait ~2 minutes for the first deploy.

### Step 3 — Import Your Data

Once deployed, your API is live at `https://secg-erp-api.onrender.com`. Open the Swagger UI:

```
https://secg-erp-api.onrender.com/api/docs
```

Then run these in order:

1. **POST /api/admin/setup** — creates all 39 database tables
2. **POST /api/admin/import/masterfile** — upload `SECG_Ultimate_Masterfile.xlsx`
3. **POST /api/admin/import/budgets** — upload your 6 budget CSV files
4. **POST /api/admin/import/leads** — upload `Leads__1_.xlsx`
5. **POST /api/admin/import/proposals** — upload `LeadProposals__9_.xlsx`
6. **POST /api/admin/import/jobs** — upload `Open_Jobs_Next_Steps_Quotes.xlsx`
7. **GET /api/admin/status** — verify row counts

Each endpoint has a file picker in Swagger UI — just click "Try it out", choose your file, and hit Execute.

### Step 4 — Use the API

The dashboard endpoint returns everything the frontend needs in one call:

```
GET /api/dashboard
```

Full endpoint list at `/api/docs`.

---

## Alternative: Run Locally

```bash
# Start Postgres
docker compose up -d

# Install deps + create tables + start server
bash setup.sh
```

Then open [localhost:8000/api/docs](http://localhost:8000/api/docs) and follow the same import steps above.

---

## API Endpoints

| Route | Description |
|---|---|
| `GET /api/dashboard` | Executive command center — all KPIs |
| `GET /api/projects` | Project list (paginated, searchable) |
| `GET /api/projects/{id}` | Full project detail with cost codes, SOV, draws, COs, milestones |
| `GET /api/vendors` | Vendor list |
| `GET /api/vendors/scorecard` | Ranked vendor scorecard |
| `GET /api/financials/debts` | Debt schedule |
| `GET /api/financials/pl` | P&L by division and period |
| `GET /api/financials/ar` | Accounts receivable |
| `GET /api/financials/cash-forecast` | 13-week cash forecast |
| `GET /api/financials/retainage` | Retainage tracker |
| `GET /api/financials/recurring` | Recurring expenses |
| `GET /api/financials/properties` | Property portfolio |
| `GET /api/financials/transactions` | Transaction log (paginated) |
| `GET /api/crm/leads` | BuilderTrend leads |
| `GET /api/crm/proposals` | Lead proposals |
| `GET /api/crm/pipeline` | Bid pipeline |
| `GET /api/crm/pipeline/summary` | Pipeline funnel for charts |
| `GET /api/team/employees` | Employee roster |
| `GET /api/team/payroll-calendar` | Upcoming payroll dates |
| `GET /api/team/crew-allocation` | Weekly crew matrix |
| `GET /api/team/lien-waivers` | Lien waiver tracker |
| `POST /api/auth/signup` | Create account (baseline auth) |
| `POST /api/auth/login` | Authenticate with username/email and password |
| `GET /api/auth/me` | Get current authenticated user profile |
| `GET /api/billing/plans` | Subscription plans catalog |
| `POST /api/billing/checkout-session` | Create Stripe Checkout session |
| `POST /api/billing/portal-session` | Open Stripe customer portal |
| `GET /api/billing/status` | Billing status by organization |
| `POST /api/billing/webhook` | Stripe webhook receiver |
| `POST /api/admin/setup` | Create database tables |
| `POST /api/admin/import/*` | Upload + import data files |
| `GET /api/admin/status` | Database row counts |

---

## Project Structure

```
secg-erp/
├── backend/
│   ├── main.py              ← FastAPI app entry point
│   ├── core/
│   │   ├── config.py        ← Settings from env vars
│   │   ├── database.py      ← SQLAlchemy engine + session
│   │   └── deps.py          ← FastAPI dependency injection
│   ├── models/
│   │   ├── core.py          ← 21 core tables (projects, vendors, cost codes...)
│   │   └── extended.py      ← 18 extended tables (debts, payroll, pipeline...)
│   ├── schemas/
│   │   └── __init__.py      ← Pydantic response schemas
│   ├── api/
│   │   ├── admin.py         ← Database setup + file upload imports
│   │   ├── dashboard.py     ← KPI aggregation
│   │   ├── projects.py      ← Project CRUD + sub-resources
│   │   ├── vendors.py       ← Vendor listing + scorecard
│   │   ├── financials.py    ← Debts, P&L, AR/AP, cash flow
│   │   ├── crm.py           ← Leads, proposals, bid pipeline
│   │   └── team.py          ← Employees, payroll, crew, lien waivers
│   └── importers/
│       ├── base.py           ← Shared utilities
│       ├── masterfile.py     ← 28-tab masterfile importer
│       ├── budgets.py        ← Budget CSV importer
│       ├── leads.py          ← BuilderTrend leads + proposals
│       ├── jobs.py           ← Open jobs + quotes
│       ├── schedule.py       ← Schedule milestones
│       └── orchestrator.py   ← Full pipeline runner
├── render.yaml               ← One-click Render deploy
├── docker-compose.yml         ← Local Postgres + Redis
├── requirements.txt           ← Python dependencies
├── setup.sh                   ← Local quick-start script
└── Procfile                   ← Render/Railway start command
```

---

## Migration Notice (Reuse-First)

This repository now includes a **monorepo scaffold** (`apps/*`, `packages/*`) for the target TypeScript platform. The current FastAPI backend in `backend/` remains the active runtime while migration occurs in vertical slices.

Audit and planning artifacts:
- `docs/CURRENT_STATE_AUDIT.md`
- `docs/GAP_ANALYSIS.md`
- `docs/REFACTOR_PLAN.md`
- `docs/PRODUCT_BLUEPRINT.md`
- `docs/IMPLEMENTATION_BACKLOG.md`

- `docs/VISUAL_MOCKUPS.md`
- `docs/PAYMENTS_SYSTEM.md`

- `docs/LOGIN_BRANDING_GUIDE.md`

- `docs/INTEGRATION_OS_STRATEGY.md`

- `scripts/set_logo.py`
- `scripts/set_logo.ps1`
- `docs/UI_UX_SPEC.md`
- `docs/REPO_STRATEGY.md`
- `scripts/first_run_check.py`
- `scripts/windows_run_now.ps1`
