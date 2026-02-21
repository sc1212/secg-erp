# UI/UX DESIGN SPEC (Review Draft)

## 1) Design status
Yes — a design direction is already established and visualized in mockups:
- `docs/login_mockup.html` (logo-first premium login)
- `docs/mockups.html` (major surface mockups)
- `docs/VISUAL_MOCKUPS.md` (ASCII wire references)

This document is the full spec for review so you can approve/reject by section.

---

## 2) Brand system
### Tone
- Premium executive
- Construction-finance serious
- High trust / low gimmick

### Color tokens (v1)
- `bg.app = #090D14`
- `bg.panel = #0F1621`
- `bg.surface = #F2F5F8`
- `text.primary = #0F1720`
- `text.secondary = #5D6876`
- `accent.gold = #D3A33F`
- `accent.silver = #D7D9DC`
- `state.success = #0E9F6E`
- `state.warning = #D97706`
- `state.danger = #DC2626`

### Typography
- Primary: Inter (fallback system sans)
- Headline weight: 700–800
- Body weight: 400–500
- Numeric emphasis in finance tables: 600

### Logo usage
- Primary source: `docs/assets/se-logo.png`
- Fallback: `docs/assets/se-logo-mark.svg`
- Login page: hero logo + card mini-logo

---

## 3) Layout specs
### Breakpoints
- Mobile: `< 768px`
- Tablet: `768–1279px`
- Desktop: `>= 1280px`

### App shell
- Header height: 64px
- Sidebar width: 280px desktop / collapsed to icon rail on tablet
- Content max width: fluid, with 24px horizontal gutter

### Data density rules
- Finance pages prioritize table-first layouts
- KPI cards always include drill-through action
- Avoid card-only views for transactional screens

---

## 4) Navigation structure
- Dashboard
- Projects
- Financials
  - AP
  - AR / Draws
  - Retainage
  - Cash Forecast
- Vendors
- CRM
- Documents
- Admin / Integrations

Breadcrumbs required on all non-root pages.

---

## 5) Core screen specs
## A) Login
- Left hero panel (logo-first, trust/value messaging)
- Right sign-in card with fields:
  - username/email
  - password
  - remember me
  - forgot password
- States:
  - idle
  - loading (button spinner + disabled)
  - invalid credentials
  - session expired redirect

## B) Executive Dashboard
- KPI ribbon: cash, backlog, gross margin, AR aging, overrun risk
- Two-column analytics row: trend chart + risk/approval queue
- Drill-through transaction table with saved views

## C) Project Financial Control
- Header: project identity, status, PM, GM
- Tabs: Overview / Cost Codes / Budget / CO / Draws / Docs
- Primary table: budget vs committed vs actual vs variance
- Right rail: pending approvals + variance reasons

## D) AP Invoice Workflow
- Intake: upload/inbox
- Coding: project + cost code + commitment mapping
- Controls: waiver requirement + approval chain
- Payment queue status + audit timeline

## E) AR/Draw Workflow
- SOV line management
- Current billing vs prior billed vs stored materials
- Retainage held/released ledger
- Payment request action and status tracking

## F) Integrations Console
- Connectors list: QuickBooks, Bank Feeds, Buildertrend bridge, Gusto, vendor portals
- Connector status: connected / degraded / disconnected
- Last sync time + error panel + retry action

---

## 6) Component specs
- `KpiCard`: title, value, delta, drill action
- `DataGrid`: server-side sort/filter/page, sticky headers, totals row
- `FilterBar`: saved views, chips, clear-all
- `ApprovalTimeline`: stage, assignee, SLA timer, audit link
- `MoneyBadge`: paid/unpaid/partial/overdue indicators
- `DocumentVersionList`: version, author, timestamp, compare/download

---

## 7) Form behavior standards
- Validation at field and submit level
- Inline error text under field
- Submit button disabled during mutation
- Retry CTA for recoverable failures
- Success toast + table refresh

---

## 8) Accessibility baseline
- Keyboard-first navigation support
- Semantic form labels and ARIA on controls
- Focus-visible ring on all interactive components
- Table headers and row actions screen-reader labels

---

## 9) Motion and interaction
- Subtle transitions only (120–180ms)
- No decorative animation on finance-critical pages
- Skeleton loading for dense tables/charts

---

## 10) Empty/loading/error states (required)
- Empty:
  - context text + primary CTA
- Loading:
  - skeleton rows for tables
- Error:
  - concise error + retry + support link

---

## 11) What I need your feedback on (design review checklist)
Please mark each item as **Keep / Change**:
1. Premium dark+gold visual direction
2. Logo-first login composition
3. Table-first finance UX
4. Right-rail approval + variance pattern on project pages
5. Integration console layout
6. KPI ribbon composition
7. Sidebar information architecture
8. Density level (high vs medium)

Once you mark these, I’ll lock the final spec and build the real UI screens.
