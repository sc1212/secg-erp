# ARCHITECTURE

## 1) Current architecture (baseline)
- FastAPI monolith in `backend/` with domain APIs and importer pipelines.
- SQLAlchemy model layer includes substantial construction-finance entities.
- Deployment + local runtime already functional.

## 2) Target architecture (monorepo)
- `apps/api` — NestJS API (tenant-aware auth/RBAC + domain modules + OpenAPI).
- `apps/web` — Next.js App Router frontend (executive-grade UX + field workflows).
- `packages/ui` — shared component system (Radix + Tailwind).
- `packages/config-*` — strict TS and lint standards.
- `packages/contracts` (next) — shared DTOs/Zod schemas/client typing.

## 3) Backend module map
- `auth`: signup/login/logout/refresh/verify/forgot/reset.
- `orgs`: organization lifecycle, divisions, membership invites.
- `rbac`: permissions, roles, grants, policy guards.
- `projects`: project metadata and health.
- `costing`: cost codes, budgets, cost events, commitments.
- `change-orders`: CO lifecycle + approval orchestration.
- `ap`: vendor invoices, payment status, waiver controls.
- `ar-draws`: SOV, pay apps, retainage and billing progress.
- `documents`: file metadata/versioning/access policies.
- `vendors`: profile, compliance, performance scorecards.
- `crm`: leads/proposals/pipeline analytics.
- `dashboard`: KPI aggregation + drill-through contracts.
- `integrations`: QuickBooks connectors/sync jobs.
- `billing`: Stripe subscription lifecycle.

## 4) Frontend component hierarchy
- App shell
  - Header
  - Sidebar
  - Breadcrumbs
  - Global search / org switcher
- Route groups
  - `(auth)` login/signup/verify/reset
  - `(app)/dashboard`
  - `(app)/projects`
  - `(app)/financials`
  - `(app)/vendors`
  - `(app)/crm`
  - `(app)/admin`
- Shared components
  - Data grid (server-side paging/sort/filter)
  - Filter bar + saved views
  - KPI ribbon + trend deltas
  - Approval timeline
  - Upload + document version panel

## 5) State management policy
- Local UI state: React state/hooks.
- Server state: TanStack Query.
- Global app state: auth/session/org/theme (Zustand).
- Query key strategy:
  - `[orgId, 'projects', filters]`
  - `[orgId, 'project', projectId]`
  - `[orgId, 'ap', filters]`
  - `[orgId, 'dashboard', timeframe]`
- Invalidation strategy:
  - mutation invalidates parent collection + impacted detail key.

## 6) Routing and authorization design
- All app routes require authenticated session except explicit public auth routes.
- Role + permission checks performed on API and mirrored in UI guards.
- Deep-linkable filtered list views via URL params for PM/finance workflows.

## 7) Breakpoint and responsive behavior
- Mobile: stacked forms, compact table columns, bottom-sheet filters.
- Tablet: collapsible sidebar, horizontal table scrolling.
- Desktop: full data-dense layouts, split panes for detail drill-down.

## 8) Cross-cutting concerns
- Request ID propagation and structured logs.
- Audit event emission for material financial changes.
- Error normalization contract shared by API client.
- Feature flags for staged rollout.
