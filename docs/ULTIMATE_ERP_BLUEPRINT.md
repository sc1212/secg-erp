# ULTIMATE CONSTRUCTION ERP BLUEPRINT — SECG ERP

**Date:** 2026-02-21
**Version:** 2.0 — "The Everything Build"
**Vision:** The most comprehensive construction ERP platform ever built. Period.

---

## TABLE OF CONTENTS

1. [Platform Overview](#1-platform-overview)
2. [NEW Modules Added (Beyond V1)](#2-new-modules-beyond-v1)
3. [Complete Module Inventory (65+ Modules)](#3-complete-module-inventory)
4. [3-Tier Plan Structure](#4-tier-plan-structure)
5. [Database Schema (75+ Tables)](#5-database-schema)
6. [API Endpoints (200+)](#6-api-endpoints)
7. [Technology Stack (Final)](#7-technology-stack)
8. [Pre-Launch Checklist](#8-pre-launch-checklist)

---

## 1. PLATFORM OVERVIEW

### What SECG ERP Does

SECG ERP is a **full-lifecycle construction management and finance platform** that handles everything from the first lead contact to the last warranty call — and every dollar, document, and crew hour in between.

**Who it's for:**
- General contractors (residential + commercial)
- Construction company owners & executives
- Project managers & superintendents
- Estimators & preconstruction teams
- Accounting & finance departments
- Field crews & subcontractors

**What makes it different:**
- Built BY a construction company, FOR construction companies
- Not a generic ERP bolted onto construction — construction-native from day one
- Consolidates 5-10 separate tools (QuickBooks, BuilderTrend, Procore, Excel) into one
- Real-time financial visibility — no more waiting for month-end reports
- AI-powered predictions for cost overruns, cash flow, and schedule delays

---

## 2. NEW MODULES BEYOND V1

Everything below is **NEW** — added to make this the ultimate construction ERP. These are on top of the 12 existing domain modules already built.

### NEW MODULE LIST (26 New Modules)

| # | Module | Category | What It Does |
|---|--------|----------|-------------|
| 1 | **Equipment & Fleet** | Operations | Track all equipment, maintenance schedules, fuel logs, depreciation, GPS location |
| 2 | **Safety & Compliance** | Field | OSHA 300 logs, incident reports, toolbox talks, safety certifications, JSAs |
| 3 | **Daily Field Reports** | Field | Daily logs with weather, crew hours, photos, notes, equipment used, visitors |
| 4 | **RFI Management** | Project | Request for Information lifecycle — create, assign, respond, close, link to drawings |
| 5 | **Submittal Tracking** | Project | Material submittals with approval chains, revision tracking, spec references |
| 6 | **Punch List Management** | Project | Closeout punch items, photo documentation, assign-to-trade, status tracking |
| 7 | **Time Tracking & Timecards** | HR/Payroll | GPS-based field timecards, geofence clock-in/out, approval workflow, OT calc |
| 8 | **Estimating & Takeoffs** | Preconstruction | Estimate templates, unit cost database, assembly libraries, bid comparison |
| 9 | **Inventory & Materials** | Operations | Warehouse management, material orders, PO tracking, delivery schedules |
| 10 | **Quality Control** | Field | QC inspection checklists, templates, deficiency logs, corrective action tracking |
| 11 | **Permit Tracking** | Compliance | Building permits, inspections, compliance dates, jurisdiction tracking |
| 12 | **Insurance & Bonding** | Risk | COI management, bond tracking, expiration alerts, coverage gaps |
| 13 | **Client Portal** | External | Owner-facing project dashboard — progress photos, draws, schedule, documents |
| 14 | **Subcontractor Portal** | External | Sub-facing portal — their POs, payments, lien waivers, compliance uploads |
| 15 | **Weather Integration** | Automation | Auto-log weather per jobsite, track weather delays, forecast impact |
| 16 | **Map & GPS Dashboard** | Operations | Project map pins, live crew GPS, equipment location, geofence zones |
| 17 | **AI Analytics Engine** | Intelligence | Predictive cost overruns, cash flow ML, NLP search, anomaly detection |
| 18 | **Mobile PWA** | Platform | Offline-capable progressive web app for field use |
| 19 | **Notification Center** | Platform | Real-time alerts, email digests, SMS alerts, push notifications, Slack/Teams |
| 20 | **Report Builder** | Reporting | Drag-and-drop custom reports, PDF/Excel export, scheduled email delivery |
| 21 | **Gantt Scheduling** | Project | Interactive Gantt charts, task dependencies, critical path, resource leveling |
| 22 | **Warranty Management** | Post-Construction | Warranty claims, expiration tracking, vendor callbacks, resolution workflow |
| 23 | **Environmental Compliance** | Compliance | SWPPP plans, EPA tracking, stormwater inspections, environmental permits |
| 24 | **Tax Management** | Finance | Sales tax by jurisdiction, payroll tax tracking, 1099 prep, tax calendar |
| 25 | **Bid Management & Leveling** | Preconstruction | ITB creation, bid packages, bid leveling/comparison, scope gap analysis |
| 26 | **Closeout & Turnover** | Project | Final documentation packages, O&M manuals, as-builts, certificate tracking |

---

## 3. COMPLETE MODULE INVENTORY (65+ Modules)

### EXISTING (Built in V1) — 12 Core Modules

| Module | Tables | Endpoints | Status |
|--------|--------|-----------|--------|
| Projects & Job Costing | 5 | 8 | Read APIs done |
| Cost Codes & Budgets | 1 | 2 | Read APIs done |
| Change Orders | 1 | 1 | Read APIs done |
| Commitments (POs/Subs) | 1 | 1 | Read APIs done |
| AR / Draws / Retainage | 5 | 4 | Read APIs done |
| AP Invoices & Payments | 4 | 2 | Read APIs done |
| Vendor Management | 1 | 3 | Read + Scorecard done |
| CRM & Pipeline | 3 | 5 | Read APIs done |
| Team & Payroll | 4 | 5 | Read APIs done |
| Financial Reporting | 6 | 10 | Read APIs done |
| Document Management | 3 | 0 | Schema only |
| Dashboard (Executive) | 0 | 1 | Full KPI aggregation |

### NEW (V2 Ultimate) — 26 New Modules

See Section 2 above for full details.

### PLATFORM MODULES (Infrastructure) — 10 Modules

| Module | What It Does |
|--------|-------------|
| Authentication & Sessions | Email/password login, JWT, refresh tokens, MFA |
| RBAC & Permissions | 6 roles, granular permission matrix |
| Multi-Tenancy | Organization scoping on all data |
| Payment & Billing (Stripe) | 3-tier subscriptions, seat billing, dunning |
| Email Service | Transactional email via Resend |
| File Storage (S3) | Presigned uploads, MIME validation |
| Background Jobs | Celery/Redis for async processing |
| QuickBooks Sync | Bi-directional QB Online integration |
| Audit Trail | Field-level change tracking on all entities |
| Activity Feed | Timeline of all actions per project/entity |

### INTEGRATION MODULES — 7 Modules

| Integration | What It Does |
|-------------|-------------|
| QuickBooks Online | Two-way sync: invoices, payments, vendors, employees, COA |
| BuilderTrend | Lead import, proposal sync, schedule sync |
| Procore | Project sync, RFI/submittal sync, daily log sync |
| Sage 300 CRE | GL export, AP/AR sync for enterprise clients |
| Google Maps API | Project locations, crew GPS, drive time |
| OpenWeatherMap | Automatic weather logging per jobsite |
| Twilio / SMS | Text notifications, field alerts, timecard reminders |

**TOTAL: 55+ Major Modules, 75+ Database Tables, 200+ API Endpoints**

---

## 4. 3-TIER PLAN STRUCTURE

### Pricing & Features by Tier

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SECG ERP PRICING TIERS                         │
├──────────────┬──────────────────┬──────────────┬───────────────────┤
│              │    CORE          │    OPS       │   ENTERPRISE      │
│              │  $149/mo         │  $349/mo     │   $749/mo         │
│              │  $1,490/yr       │  $3,490/yr   │   $7,490/yr       │
│              │  (save $298)     │  (save $698) │   (save $1,498)   │
├──────────────┼──────────────────┼──────────────┼───────────────────┤
│ Users        │ Up to 5          │ Up to 25     │ Unlimited         │
│ Projects     │ Up to 15         │ Up to 100    │ Unlimited         │
│ Storage      │ 10 GB            │ 100 GB       │ 1 TB              │
├──────────────┼──────────────────┼──────────────┼───────────────────┤
│ CORE         │                  │              │                   │
│ Dashboard    │ ✓                │ ✓            │ ✓                 │
│ Projects     │ ✓                │ ✓            │ ✓                 │
│ Budgets      │ ✓                │ ✓            │ ✓                 │
│ Cost Codes   │ ✓                │ ✓            │ ✓                 │
│ Change Ord.  │ ✓                │ ✓            │ ✓                 │
│ Invoicing    │ ✓                │ ✓            │ ✓                 │
│ Vendors      │ ✓                │ ✓            │ ✓                 │
│ Documents    │ ✓                │ ✓            │ ✓                 │
├──────────────┼──────────────────┼──────────────┼───────────────────┤
│ OPS          │                  │              │                   │
│ CRM/Pipeline │ —                │ ✓            │ ✓                 │
│ Draws/SOV    │ —                │ ✓            │ ✓                 │
│ Retainage    │ —                │ ✓            │ ✓                 │
│ Cash Forecast│ —                │ ✓            │ ✓                 │
│ P&L Reports  │ —                │ ✓            │ ✓                 │
│ Payroll      │ —                │ ✓            │ ✓                 │
│ Crew Sched.  │ —                │ ✓            │ ✓                 │
│ Time Track.  │ —                │ ✓            │ ✓                 │
│ Safety       │ —                │ ✓            │ ✓                 │
│ Daily Logs   │ —                │ ✓            │ ✓                 │
│ Punch Lists  │ —                │ ✓            │ ✓                 │
│ RFIs         │ —                │ ✓            │ ✓                 │
│ Submittals   │ —                │ ✓            │ ✓                 │
│ Equipment    │ —                │ ✓            │ ✓                 │
│ Permits      │ —                │ ✓            │ ✓                 │
├──────────────┼──────────────────┼──────────────┼───────────────────┤
│ ENTERPRISE   │                  │              │                   │
│ AI Analytics │ —                │ —            │ ✓                 │
│ Estimating   │ —                │ —            │ ✓                 │
│ Bid Leveling │ —                │ —            │ ✓                 │
│ Client Portal│ —                │ —            │ ✓                 │
│ Sub Portal   │ —                │ —            │ ✓                 │
│ Gantt Sched. │ —                │ —            │ ✓                 │
│ Report Bldr. │ —                │ —            │ ✓                 │
│ QB Sync      │ —                │ —            │ ✓                 │
│ Procore Sync │ —                │ —            │ ✓                 │
│ Multi-Entity │ —                │ —            │ ✓                 │
│ Custom Roles │ —                │ —            │ ✓                 │
│ API Access   │ —                │ —            │ ✓                 │
│ SSO (SAML)   │ —                │ —            │ ✓                 │
│ Warranty Mgmt│ —                │ —            │ ✓                 │
│ Closeout Pkg │ —                │ —            │ ✓                 │
│ Env Complnce │ —                │ —            │ ✓                 │
│ Tax Mgmt     │ —                │ —            │ ✓                 │
│ Audit Export │ —                │ —            │ ✓                 │
│ Priority Supp│ —                │ —            │ ✓                 │
├──────────────┼──────────────────┼──────────────┼───────────────────┤
│ Add-ons      │ $15/user/mo      │ $12/user/mo  │ Included          │
│ (extra seats)│                  │              │                   │
└──────────────┴──────────────────┴──────────────┴───────────────────┘
```

### Billing Rules
- **No trial period** — paid from day one
- **Dunning:** 7-day retry on failed payments (days 1, 3, 5, 7 then suspend)
- **Annual billing:** 2 months free (16.7% discount)
- **Upgrade:** Instant, prorated
- **Downgrade:** At next billing cycle
- **Cancellation:** Immediate access to end of paid period, data export available for 30 days

---

## 5. DATABASE SCHEMA (75+ Tables)

### NEW Tables to Add (36 new tables)

#### Platform Tables (6)
```sql
organizations          -- Multi-tenant org accounts
users                  -- User accounts (separate from employees)
memberships            -- User ↔ Org with role
refresh_tokens         -- JWT refresh token storage
subscriptions          -- Stripe subscription tracking
billing_events         -- Payment history / receipts
```

#### Equipment & Fleet (3)
```sql
equipment              -- id, name, type, make, model, year, serial, status,
                       -- purchase_price, current_value, depreciation_method,
                       -- hourly_rate, location, assigned_project_id, gps_lat, gps_lng
equipment_maintenance  -- id, equipment_id, service_type, date, cost, vendor_id,
                       -- next_service_date, odometer, hours, notes
fuel_logs              -- id, equipment_id, date, gallons, cost_per_gallon,
                       -- total_cost, odometer, location
```

#### Safety & Compliance (4)
```sql
safety_incidents       -- id, project_id, date, type (near_miss/first_aid/recordable/lost_time),
                       -- description, employee_id, witness, root_cause, corrective_action, osha_reported
toolbox_talks          -- id, project_id, date, topic, presenter_id, attendee_count, notes, sign_off_doc_id
safety_certifications  -- id, employee_id, cert_name, cert_number, issued_date,
                       -- expiry_date, issuing_body, status
jsa_forms              -- id, project_id, task_description, hazards, controls,
                       -- ppe_required, supervisor_id, date, crew_signed
```

#### Field Operations (3)
```sql
daily_reports          -- id, project_id, date, superintendent_id, weather_condition,
                       -- temp_high, temp_low, wind, precipitation, crew_count,
                       -- work_performed, delays, visitors, photos, notes
rfi_items              -- id, project_id, number, subject, from_party, to_party,
                       -- question, answer, status, priority, due_date,
                       -- cost_impact, schedule_impact, linked_drawing
submittals             -- id, project_id, number, title, spec_section,
                       -- vendor_id, status, submitted_date, required_date,
                       -- revision, reviewer_id, response_date, notes
```

#### Punch Lists & Closeout (3)
```sql
punch_items            -- id, project_id, room_location, description, trade,
                       -- assigned_vendor_id, priority, status, photo_id,
                       -- created_by, due_date, completed_date
warranty_items         -- id, project_id, vendor_id, description, category,
                       -- start_date, end_date, claim_date, status,
                       -- resolution, cost
closeout_items         -- id, project_id, item_type (as_built/o_m/cert/warranty/lien_release),
                       -- description, status, responsible_party, due_date, document_id
```

#### Time Tracking (2)
```sql
timecards              -- id, employee_id, project_id, date, clock_in, clock_out,
                       -- hours_regular, hours_overtime, hours_double,
                       -- cost_code_id, gps_lat_in, gps_lng_in, approved_by, status
geofences              -- id, project_id, name, center_lat, center_lng,
                       -- radius_meters, enforce_clock
```

#### Estimating & Bidding (4)
```sql
estimates              -- id, project_id, name, version, status, estimator_id,
                       -- total_cost, markup_pct, total_price, created_at
estimate_lines         -- id, estimate_id, cost_code_id, description,
                       -- quantity, unit, unit_cost, total_cost, source
unit_cost_database     -- id, description, unit, cost, trade, region,
                       -- last_updated, source
bid_packages           -- id, project_id, trade, scope_description,
                       -- due_date, vendors_invited, status, awarded_vendor_id
```

#### Inventory & Materials (2)
```sql
inventory_items        -- id, name, sku, category, unit, quantity_on_hand,
                       -- reorder_point, location, unit_cost, last_counted
material_orders        -- id, project_id, vendor_id, po_number, status,
                       -- order_date, expected_delivery, actual_delivery,
                       -- total_amount, notes
```

#### Quality Control (2)
```sql
qc_inspections         -- id, project_id, inspection_type, date, inspector_id,
                       -- result (pass/fail/conditional), notes, deficiency_count
qc_deficiencies        -- id, inspection_id, location, description, severity,
                       -- assigned_to, due_date, status, resolution, photo_id
```

#### Permits & Compliance (2)
```sql
permits                -- id, project_id, permit_type, number, jurisdiction,
                       -- applied_date, issued_date, expiry_date, status,
                       -- fee, inspector, notes
inspections            -- id, permit_id, inspection_type, scheduled_date,
                       -- actual_date, result, inspector_name, notes, next_action
```

#### Insurance & Bonding (2)
```sql
insurance_policies     -- id, entity_type (vendor/project/org), entity_id,
                       -- policy_type (GL/WC/auto/umbrella/builders_risk),
                       -- carrier, policy_number, coverage_amount,
                       -- effective_date, expiry_date, premium, status
bonds                  -- id, project_id, bond_type (bid/performance/payment),
                       -- surety, principal, obligee, amount, effective_date,
                       -- expiry_date, premium, status
```

#### Notifications & Activity (2)
```sql
notifications          -- id, user_id, type, title, message, entity_type,
                       -- entity_id, read_at, action_url, created_at
activity_feed          -- id, org_id, actor_id, action, entity_type,
                       -- entity_id, metadata_json, created_at
```

#### Integrations (2)
```sql
integration_configs    -- id, org_id, provider (quickbooks/procore/buildertrend),
                       -- access_token_enc, refresh_token_enc, settings_json,
                       -- last_sync_at, status
sync_logs              -- id, integration_id, direction (push/pull), entity_type,
                       -- records_processed, records_failed, started_at,
                       -- completed_at, error_log
```

---

## 6. API ENDPOINTS (200+)

### New Endpoint Groups

**Equipment & Fleet (8 endpoints)**
```
GET    /api/equipment                    Paginated equipment list
POST   /api/equipment                    Add equipment
GET    /api/equipment/{id}               Equipment detail + maintenance history
PUT    /api/equipment/{id}               Update equipment
GET    /api/equipment/{id}/maintenance   Maintenance log
POST   /api/equipment/{id}/maintenance   Log maintenance event
GET    /api/equipment/{id}/fuel          Fuel log
POST   /api/equipment/{id}/fuel          Log fuel fill
```

**Safety (10 endpoints)**
```
GET    /api/safety/incidents             All incidents (filterable)
POST   /api/safety/incidents             Report incident
GET    /api/safety/incidents/{id}        Incident detail
PUT    /api/safety/incidents/{id}        Update incident
GET    /api/safety/toolbox-talks         Toolbox talk log
POST   /api/safety/toolbox-talks         Log toolbox talk
GET    /api/safety/certifications        All certifications
POST   /api/safety/certifications        Add certification
GET    /api/safety/dashboard             Safety KPIs (TRIR, DART, EMR)
GET    /api/safety/expiring              Expiring certifications alert
```

**Daily Reports (6 endpoints)**
```
GET    /api/daily-reports                All daily reports (by project/date)
POST   /api/daily-reports                Create daily report
GET    /api/daily-reports/{id}           Report detail with photos
PUT    /api/daily-reports/{id}           Update report
GET    /api/daily-reports/summary        Weekly/monthly summary
POST   /api/daily-reports/{id}/photos    Upload photos
```

**RFIs (6 endpoints)**
```
GET    /api/rfis                         All RFIs (paginated, filterable)
POST   /api/rfis                         Create RFI
GET    /api/rfis/{id}                    RFI detail with thread
PUT    /api/rfis/{id}                    Update/respond to RFI
PATCH  /api/rfis/{id}/status             Change status
GET    /api/rfis/overdue                 Overdue RFIs alert
```

**Submittals (6 endpoints)**
```
GET    /api/submittals                   All submittals
POST   /api/submittals                   Create submittal
GET    /api/submittals/{id}              Submittal detail
PUT    /api/submittals/{id}              Update submittal
PATCH  /api/submittals/{id}/review       Review/approve/reject
GET    /api/submittals/log               Submittal register/log
```

**Punch Lists (6 endpoints)**
```
GET    /api/punch-lists/{project_id}     All punch items for project
POST   /api/punch-lists                  Create punch item
PUT    /api/punch-lists/{id}             Update punch item
PATCH  /api/punch-lists/{id}/complete    Mark complete
GET    /api/punch-lists/summary          Punch list summary by trade
POST   /api/punch-lists/{id}/photos      Upload photo evidence
```

**Time Tracking (8 endpoints)**
```
GET    /api/timecards                    All timecards (by employee/project/week)
POST   /api/timecards/clock-in           Clock in (with GPS)
POST   /api/timecards/clock-out          Clock out (with GPS)
PUT    /api/timecards/{id}               Edit timecard
PATCH  /api/timecards/{id}/approve       Approve timecard
GET    /api/timecards/weekly-summary     Weekly summary by project
GET    /api/timecards/overtime-report    Overtime report
GET    /api/geofences                    All geofence zones
```

**Estimating (8 endpoints)**
```
GET    /api/estimates                    All estimates
POST   /api/estimates                    Create estimate
GET    /api/estimates/{id}               Estimate detail with lines
PUT    /api/estimates/{id}               Update estimate
POST   /api/estimates/{id}/lines         Add estimate line
GET    /api/estimates/{id}/export        Export to PDF/Excel
GET    /api/unit-costs                   Unit cost database
GET    /api/bid-packages                 All bid packages
```

**QC Inspections (6 endpoints)**
```
GET    /api/qc/inspections               All inspections
POST   /api/qc/inspections               Create inspection
GET    /api/qc/inspections/{id}          Inspection detail
POST   /api/qc/deficiencies              Log deficiency
PATCH  /api/qc/deficiencies/{id}/resolve Resolve deficiency
GET    /api/qc/dashboard                 QC dashboard metrics
```

**Permits (6 endpoints)**
```
GET    /api/permits                      All permits
POST   /api/permits                      Add permit
GET    /api/permits/{id}                 Permit detail + inspections
POST   /api/permits/{id}/inspections     Log inspection result
GET    /api/permits/expiring             Expiring permits alert
GET    /api/permits/calendar             Inspection calendar
```

**Insurance & Bonding (6 endpoints)**
```
GET    /api/insurance                    All policies
POST   /api/insurance                    Add policy
GET    /api/insurance/expiring           Expiring policies (30/60/90 day)
GET    /api/bonds                        All bonds
POST   /api/bonds                        Add bond
GET    /api/bonds/summary                Bond capacity summary
```

**Warranty & Closeout (6 endpoints)**
```
GET    /api/warranties                   All warranty items
POST   /api/warranties                   Log warranty claim
PATCH  /api/warranties/{id}              Update warranty status
GET    /api/closeout/{project_id}        Closeout checklist for project
POST   /api/closeout/{project_id}/items  Add closeout item
PATCH  /api/closeout/items/{id}          Update closeout item status
```

**Notifications (4 endpoints)**
```
GET    /api/notifications                User notifications (unread first)
PATCH  /api/notifications/{id}/read      Mark as read
POST   /api/notifications/mark-all-read  Mark all as read
GET    /api/activity-feed                Activity feed (org-wide or per project)
```

**Reports (4 endpoints)**
```
GET    /api/reports/templates            Available report templates
POST   /api/reports/generate             Generate custom report
GET    /api/reports/{id}/download        Download PDF/Excel
POST   /api/reports/schedule             Schedule recurring report
```

**Integrations (4 endpoints)**
```
GET    /api/integrations                 All configured integrations
POST   /api/integrations/{provider}/connect   Start OAuth connection
POST   /api/integrations/{provider}/sync      Trigger manual sync
GET    /api/integrations/{provider}/logs      Sync history
```

---

## 7. TECHNOLOGY STACK (Final)

### Backend (Python)
```
FastAPI 0.115          → REST API framework
SQLAlchemy 2.0         → ORM
Alembic 1.14           → Database migrations
PostgreSQL 16          → Primary database
Redis 7                → Cache + job queue
Celery 5               → Background task processing
PyJWT                  → JWT authentication
Bcrypt                 → Password hashing
Boto3                  → AWS S3 file storage
Stripe Python SDK      → Payment processing
Resend                 → Transactional email
Pillow                 → Image processing
ReportLab              → PDF generation
Httpx                  → External API calls
Pydantic 2.10          → Data validation
Python-jose            → JWT encoding/decoding
Passlib                → Password hashing utilities
```

### Frontend (TypeScript)
```
Next.js 15             → React framework (App Router)
React 19               → UI library
TypeScript 5.5         → Type safety
Tailwind CSS 4         → Utility-first styling
shadcn/ui              → Component library
Recharts               → Charts and graphs
TanStack Table         → Data tables
TanStack Query         → Server state management
React Hook Form        → Form management
Zod                    → Schema validation
Zustand                → Client state management
Framer Motion          → Animations
Lucide React           → Icon library
next-auth              → Auth session (frontend)
@stripe/react-stripe-js → Payment UI
date-fns               → Date utilities
```

### Infrastructure
```
Docker + Docker Compose → Local development
GitHub Actions          → CI/CD pipeline
Render.com              → Production hosting
AWS S3                  → File storage
Stripe                  → Payments
Resend                  → Email
Sentry                  → Error tracking
Posthog                 → Analytics / telemetry
```

---

## 8. WHAT'S DIFFERENT FROM V1

### Summary of ALL New Additions

| Category | V1 (What We Had) | V2 Ultimate (What We Now Have) |
|----------|-------------------|-------------------------------|
| **Modules** | 12 domain modules | 55+ modules |
| **Tables** | 39 tables | 75+ tables |
| **Endpoints** | 41 (all GET) | 200+ (full CRUD) |
| **Frontend** | None | Full Next.js app |
| **Auth** | None | JWT + MFA + RBAC |
| **Payments** | None | Stripe 3-tier |
| **Field Ops** | None | Daily logs, safety, time tracking, QC |
| **Preconstruction** | None | Estimating, bid leveling, bid packages |
| **Closeout** | None | Punch lists, warranty, closeout packages |
| **Compliance** | None | OSHA, permits, environmental, insurance |
| **Equipment** | None | Fleet tracking, maintenance, fuel |
| **Integrations** | QB fields only | QB, Procore, BuilderTrend, Maps, Weather |
| **AI** | None | Predictive analytics, anomaly detection |
| **Portals** | None | Client portal, sub portal |
| **Mobile** | None | PWA with offline |
| **Reports** | None | Custom report builder, PDF export |
| **Scheduling** | Basic milestones | Gantt charts with dependencies |
| **Notifications** | None | Real-time + email + SMS + push |
| **Maps** | None | GPS tracking, project locations |

This is no longer just a financial ERP — it's the **complete operating system for a construction company**.
