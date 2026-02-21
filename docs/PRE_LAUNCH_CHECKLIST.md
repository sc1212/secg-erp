# PRE-LAUNCH CHECKLIST — First Test Run

**Date:** 2026-02-21
**Goal:** Everything needed before Matt and the team can log in and start using SECG ERP

---

## CRITICAL PATH (Must Have for Test Run)

### 1. Authentication & Login (BLOCKING)
- [ ] `users` table created with password hashing
- [ ] Login endpoint (POST /api/auth/login)
- [ ] JWT access + refresh token generation
- [ ] Login page built (SE gold branding, premium executive)
- [ ] Forgot password flow (email + reset page)
- [ ] Session management (auto-refresh, logout)
- [ ] Create initial admin accounts (Matt + team)
- **Status:** NOT STARTED
- **Priority:** #1 — Nothing works without this

### 2. Protected App Shell (BLOCKING)
- [ ] Sidebar navigation with all menu items
- [ ] Header with search, notifications, user avatar
- [ ] Auth guard (redirect to login if not authenticated)
- [ ] Responsive layout (desktop + tablet + mobile)
- [ ] SE branding applied (gold/charcoal theme, logo)
- [ ] Route structure for all pages
- **Status:** NOT STARTED
- **Priority:** #2 — The frame everything lives in

### 3. Dashboard Page (HIGH)
- [ ] Wire up existing GET /api/dashboard endpoint to frontend
- [ ] 8 KPI cards (cash, AR, AP, projects, pipeline, retainage, payroll, credit)
- [ ] Budget vs actuals chart
- [ ] Cash flow forecast chart
- [ ] Alerts panel
- **Status:** Backend API done, frontend not started
- **Priority:** #3 — First thing users see after login

### 4. Projects Pages (HIGH)
- [ ] Project list page with search, filter, pagination
- [ ] Project detail page with tabbed views
- [ ] Cost code breakdown table
- [ ] Change orders list
- [ ] SOV / draws view
- [ ] Wire up existing GET endpoints
- **Status:** Backend APIs done (8 endpoints), frontend not started
- **Priority:** #4 — Core daily use

### 5. Bank Connection / Plaid (HIGH)
- [ ] Plaid developer account created
- [ ] Plaid Link integration (frontend widget)
- [ ] `connected_accounts` table
- [ ] `bank_transactions` table
- [ ] Balance fetch endpoint
- [ ] Transaction sync (pull from Plaid)
- [ ] Transaction auto-categorization (vendor matching)
- [ ] Connected accounts dashboard view
- **Status:** NOT STARTED
- **Priority:** #5 — Replaces logging into bank portals

### 6. Payment Hub - Pay Vendors (HIGH)
- [ ] Stripe Connect account setup
- [ ] ACH payment initiation via Stripe
- [ ] `outbound_payments` table
- [ ] Pay vendor flow (select invoices → retainage → lien waiver → send)
- [ ] Payment approval workflow (PM/Owner)
- [ ] Cost coding on payment (project + cost code)
- [ ] Auto-update budget actuals on payment
- **Status:** NOT STARTED
- **Priority:** #6 — Replace writing checks / bank transfers

### 7. Payment Hub - Request Payments (HIGH)
- [ ] Stripe invoice creation
- [ ] Payment link generation
- [ ] `payment_requests` table
- [ ] Invoice builder UI (line items, retainage, previous draws)
- [ ] Client payment portal page (branded, multiple payment methods)
- [ ] Webhook: payment received → update AR → notify PM
- [ ] PDF invoice generation
- **Status:** NOT STARTED
- **Priority:** #7 — Replace emailing invoices manually

---

## IMPORTANT (Need Soon After Test Run)

### 8. QuickBooks Online Sync
- [ ] QBO developer account + OAuth app
- [ ] OAuth connection flow (Settings → Integrations → Connect)
- [ ] Chart of Accounts sync (pull from QBO)
- [ ] Vendor sync (bidirectional)
- [ ] Invoice sync (push to QBO)
- [ ] Payment sync (pull from QBO)
- [ ] Expense/bill sync
- **Status:** QB ID fields exist on all models, no sync code
- **Priority:** HIGH — Replaces manual QB entry

### 9. Gusto Payroll Integration
- [ ] Gusto developer account + OAuth app
- [ ] Employee roster pull
- [ ] Payroll run data pull
- [ ] Map payroll costs to projects (crew allocation)
- [ ] Payroll calendar sync
- **Status:** NOT STARTED
- **Priority:** HIGH — Replaces checking Gusto separately

### 10. Materials / Procurement Module
- [ ] Material order creation UI
- [ ] Budget check before ordering
- [ ] Approval routing (field → PM → owner based on amount)
- [ ] HD Pro / Lowes Pro transaction matching via Plaid
- [ ] Receipt upload + OCR
- [ ] Order history by project
- **Status:** NOT STARTED
- **Priority:** HIGH — Replaces field crews going off-system

### 11. Financial Reports
- [ ] Wire up P&L endpoint to frontend page
- [ ] Wire up cash forecast endpoint to frontend
- [ ] Wire up AR aging endpoint
- [ ] Wire up debt schedule endpoint
- [ ] Wire up retainage tracker
- [ ] Wire up recurring expenses
- [ ] Export to PDF / Excel
- **Status:** Backend APIs done (10 endpoints), frontend not started
- **Priority:** MEDIUM-HIGH

### 12. Vendor Management
- [ ] Wire up vendor list + scorecard to frontend
- [ ] Vendor detail page (commitments, payments, performance)
- [ ] Add/edit vendor forms
- [ ] Lien waiver tracking per vendor
- **Status:** Backend APIs done (3 endpoints), frontend not started
- **Priority:** MEDIUM-HIGH

### 13. CRM / Pipeline
- [ ] Wire up leads + pipeline to frontend
- [ ] Kanban board view (drag-and-drop status changes)
- [ ] Lead detail with proposals
- [ ] Pipeline summary charts
- **Status:** Backend APIs done (5 endpoints), frontend not started
- **Priority:** MEDIUM — Replaces BuilderTrend CRM

### 14. Team & HR
- [ ] Wire up employee roster to frontend
- [ ] Crew allocation matrix view
- [ ] Payroll calendar view
- [ ] Lien waiver risk assessment
- **Status:** Backend APIs done (5 endpoints), frontend not started
- **Priority:** MEDIUM

---

## NEEDED BEFORE PRODUCTION (After Test Run)

### 15. CRUD Write Endpoints
- [ ] POST/PUT/DELETE for projects
- [ ] POST/PUT/DELETE for vendors
- [ ] POST/PUT for cost codes & budgets
- [ ] POST/PUT for change orders (with approval workflow)
- [ ] POST/PUT for commitments
- [ ] POST for pay apps / draws
- [ ] POST/PUT for invoices
- [ ] POST/PUT for leads & pipeline entries
- **Status:** Zero write endpoints exist (all read-only)
- **Priority:** Must have before team can enter new data

### 16. RBAC & Permissions
- [ ] Role definitions (Owner, Admin, PM, Finance, Field, Viewer)
- [ ] Permission matrix
- [ ] Auth middleware on all endpoints
- [ ] Role assignment on user invite
- **Status:** NOT STARTED
- **Priority:** Must have before multi-user

### 17. Field Operations
- [ ] Daily report creation form
- [ ] Photo upload (S3)
- [ ] Weather auto-fill (OpenWeatherMap API)
- [ ] Time tracking / clock in-out
- [ ] Safety incident reporting
- [ ] Toolbox talk logging
- **Status:** NOT STARTED
- **Priority:** MEDIUM — Needed when field crews onboard

### 18. Document Management
- [ ] S3 bucket setup
- [ ] Presigned URL upload/download
- [ ] Document list per project
- [ ] Version tracking
- [ ] Document categories/tags
- **Status:** Schema exists, no storage integration
- **Priority:** MEDIUM

### 19. Database Migrations (Alembic)
- [ ] Initialize Alembic in backend
- [ ] Generate initial migration from existing 39 tables
- [ ] Migration for new tables (users, connected_accounts, etc.)
- [ ] Migration scripts for all new modules
- **Status:** Alembic in requirements, not initialized
- **Priority:** Must have before production (using create_all() for dev)

### 20. Testing
- [ ] pytest setup with test database
- [ ] Auth endpoint tests
- [ ] Payment endpoint tests
- [ ] Integration tests for Plaid/Stripe/QBO
- [ ] Frontend component tests (Vitest)
- [ ] E2E tests (Playwright)
- **Status:** Zero tests exist
- **Priority:** Must have before production

### 21. CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Lint + typecheck on PR
- [ ] Run tests on PR
- [ ] Auto-deploy to staging on merge to main
- [ ] Deploy to production on release tag
- **Status:** NOT STARTED
- **Priority:** Must have before team starts shipping

### 22. Email Service
- [ ] Resend account setup
- [ ] Invoice email template
- [ ] Payment confirmation template
- [ ] Password reset template
- [ ] Team invite template
- [ ] Alert digest template
- **Status:** NOT STARTED
- **Priority:** Must have for payment requests + auth

---

## ENVIRONMENT & ACCOUNTS NEEDED

### Third-Party Accounts to Create

| Service | Purpose | Account Type | Est. Cost |
|---------|---------|-------------|-----------|
| **Stripe** | Payments (pay vendors + get paid) | Business account | 2.9% + $0.30/txn |
| **Plaid** | Bank connections | Development → Production | $0 dev, usage-based prod |
| **Resend** | Transactional email | Free tier → Pro | $0 to start, $20/mo later |
| **AWS S3** | File/document storage | Standard bucket | ~$5-20/mo |
| **Intuit/QBO** | QuickBooks API | Developer account | Free dev, $50/mo app fee |
| **Gusto** | Payroll API | Partner account | Contact Gusto |
| **Vercel** | Frontend hosting | Pro plan | $20/mo |
| **Render** | Backend hosting | Standard plan | $25/mo |
| **Sentry** | Error tracking | Free tier | $0 to start |
| **OpenWeatherMap** | Weather data | Free tier | $0 |
| **Twilio** | SMS alerts | Pay-as-you-go | ~$0.0075/SMS |
| **Google Maps** | Project locations | API key | $200 free credit/mo |

### Environment Variables Needed

```env
# Database (already have)
DATABASE_URL=postgresql://...

# Auth (NEW)
SECRET_KEY=...              # JWT signing key (generate: openssl rand -hex 32)
REFRESH_SECRET_KEY=...      # Refresh token key

# Stripe (NEW)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid (NEW)
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox

# Email (NEW)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@secgerp.com

# File Storage (NEW)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=secg-erp-files
AWS_S3_REGION=us-east-1

# QuickBooks (LATER)
QBO_CLIENT_ID=...
QBO_CLIENT_SECRET=...

# Gusto (LATER)
GUSTO_CLIENT_ID=...
GUSTO_CLIENT_SECRET=...
```

---

## RECOMMENDED BUILD ORDER (Sprint Plan)

### Sprint 1 (This Week): Auth + Shell
```
Day 1-2: Users table, auth endpoints, JWT, password hashing
Day 3-4: Login page (SE branding), forgot/reset password
Day 5:   App shell (sidebar, header, routing, auth guard)
```

### Sprint 2 (Next Week): Dashboard + Projects + Basic Payments
```
Day 1:   Dashboard page (wire up existing API)
Day 2-3: Projects list + detail pages (wire up existing APIs)
Day 4-5: Stripe setup, basic outbound payment flow
```

### Sprint 3: Bank Connections + Payment Hub
```
Day 1-2: Plaid integration (connect bank, pull balances)
Day 3:   Transaction feed + auto-categorization
Day 4-5: Request payment flow (invoice builder + client portal)
```

### Sprint 4: QuickBooks + Gusto + Financial Views
```
Day 1-2: QBO OAuth + sync (accounts, vendors, invoices)
Day 3:   Gusto OAuth + payroll data pull
Day 4-5: Financial report pages (P&L, cash forecast, AR/AP)
```

### Sprint 5: Vendors + CRM + Materials
```
Day 1:   Vendor pages + scorecard
Day 2-3: CRM pipeline (kanban board)
Day 4-5: Material ordering + HD/Lowes matching
```

### Sprint 6: Team + Field Ops + Polish
```
Day 1:   Team roster + crew allocation
Day 2:   Daily report form + photo upload
Day 3:   Safety module basics
Day 4-5: Bug fixes, polish, mobile responsive testing
```

---

## READY FOR TEST RUN AFTER:
- Sprint 1 complete (can log in)
- Sprint 2 complete (can see dashboard + projects + make a payment)
- Sprint 3 complete (can see bank accounts + send invoices)

**Minimum viable test run = Sprints 1-3 (~3 weeks)**

Everything else builds on top of that foundation.
