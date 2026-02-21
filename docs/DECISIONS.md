# DECISIONS (ADR-style)

## 2026-02-20

### ADR-001: Platform stack lock
- **Decision:** Lock target stack to pnpm + Turborepo + TypeScript, Next.js frontend, NestJS backend, PostgreSQL, Prisma, Redis/BullMQ.
- **Why:** Matches requested default stack and supports multi-tenant SaaS scale.
- **Consequence:** Existing FastAPI backend remains as transitional baseline while TypeScript services are introduced in slices.

### ADR-002: Reuse-first migration strategy
- **Decision:** Preserve current Python domain capabilities and avoid rewrite before audit completion.
- **Why:** Existing project/financial workflows are already valuable and reduce delivery risk.
- **Consequence:** Use strangler pattern: new platform layers wrap/migrate old logic gradually.

### ADR-003: Status Baseline interpretation
- **Decision:** Treat implemented repository behavior as baseline source of truth where explicit Status Baseline entries are not present as a separate file.
- **Why:** Prevent accidental rebuild of already shipped modules.
- **Consequence:** Every feature decision must be tagged reuse/refactor/replace/missing.

### ADR-004: Product scope expansion to enterprise blueprint
- **Decision:** Add advanced roadmap modules (predictive overrun risk, cash crunch radar, anomaly feed, approval SLA analytics) as formal backlog items.
- **Why:** Increases differentiation for premium construction ERP positioning and improves executive decision velocity.
- **Consequence:** Prioritize foundational controls first; advanced intelligence ships after core transactional integrity.

### ADR-005: Default provider choices
- **Decision:** Default transactional email provider to Resend and keep QuickBooks integration as a dedicated service module in commercialization phase.
- **Why:** Fast implementation velocity with strong developer ergonomics and explicit accounting integration boundary.
- **Consequence:** Add provider abstraction to avoid lock-in.


### ADR-006: Billing-first baseline in current backend
- **Decision:** Implement Stripe billing baseline in existing FastAPI runtime now (plans, checkout, portal, webhook, status) before NestJS migration parity.
- **Why:** Immediate path to monetization and user-requested smooth payment experience without waiting for full platform migration.
- **Consequence:** Preserve API contract semantics during migration; re-implement equivalent module in `apps/api` later.


### ADR-007: Auth baseline in current runtime
- **Decision:** Implement immediate FastAPI auth baseline (`signup`, `login`, `me`) with JWT access token for secure entry while broader tenant/RBAC platform work continues.
- **Why:** User requested a real, legit login experience now (username/email + password) and it unblocks protected-route UX in parallel with platform migration.
- **Consequence:** Add migration path to refresh token rotation and full session management in upcoming auth hardening slice.


### ADR-008: Billing and login launch defaults confirmed
- **Decision:** Launch with no trial, 7-day dunning retry window, and 3 billing tiers (Core/Ops/Enterprise); login tone set to premium executive with provided brand logo.
- **Why:** Stakeholder selected these defaults explicitly for first release behavior and visual brand posture.
- **Consequence:** Configure checkout and dunning implementation around these defaults; maintain logo-first branded login in web UI.


### ADR-009: Internal operating system priority over commercialization
- **Decision:** Prioritize internal team workflow unification (Buildertrend/QuickBooks/bank/vendor/payroll portal replacement) before subscription monetization features.
- **Why:** Immediate business value is operational consolidation for Southeast Enterprise; SaaS packaging is a later phase.
- **Consequence:** Stripe roadmap prioritizes AR/AP money movement first; subscription billing remains deferred backlog.


### ADR-010: Canonical repository decision
- **Decision:** Use `sc1212/erp` as the single canonical repository (Option A).
- **Why:** Prevent active-repo divergence and keep CI/deploy/docs/migrations in one source of truth.
- **Consequence:** `sc1212/SECG1` becomes mirror/archive unless explicitly changed later.
# DECISIONS LOG — SECG ERP

Architecture Decision Records (ADR-style). Each entry is immutable once logged.

---

## ADR-001: Keep Python/FastAPI Backend

**Date:** 2026-02-20
**Status:** Proposed (pending owner approval)
**Context:** Product spec calls for TypeScript/NestJS backend. Existing codebase is Python/FastAPI with 39 tables, 41 endpoints, and 7 production importers (~5,000 lines of domain-specific code).

**Decision:** Keep the Python/FastAPI backend. Build the frontend in Next.js/TypeScript.

**Rationale:**
- 5,000+ lines of tested, production-quality import logic maps real SECG masterfile data
- 39-table construction-domain schema is comprehensive and correct
- Rewriting to TypeScript would cost weeks for zero user-facing value
- FastAPI auto-generates OpenAPI docs (a spec requirement)
- Python + FastAPI is production-grade (Netflix, Uber, Microsoft use it)
- The frontend (100% missing) is where all user value lies

**Consequences:**
- Backend uses pip/Poetry, frontend uses pnpm
- Types shared via OpenAPI spec → generated TypeScript client
- Developers need Python 3.11+ AND Node 20+ locally
- Monorepo structure: `apps/api` (Python) + `apps/web` (Next.js)

---

## ADR-002: Reuse-First Migration Strategy

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Preserve current Python domain capabilities and avoid rewrite before audit completion. Use monorepo with pnpm workspaces + Turborepo for frontend orchestration, pip for Python backend.

**Structure:**
```
apps/api/     ← Python/FastAPI backend
apps/web/     ← Next.js frontend
packages/     ← Shared TS packages (types, utils)
docs/         ← All documentation
```

**Rationale:** Existing project/financial workflows are already valuable and reduce delivery risk. Use strangler pattern: new platform layers wrap/migrate old logic gradually.

**Consequence:** Every feature decision must be tagged reuse/refactor/replace/missing.

---

## ADR-003: Alembic for Database Migrations

**Date:** 2026-02-20
**Status:** Proposed
**Decision:** Replace `Base.metadata.create_all()` with Alembic versioned migrations.

**Rationale:** Production systems need reversible, version-controlled schema changes. Current approach creates tables but can't alter them.

---

## ADR-004: Multi-Tenancy via Organization ID Column

**Date:** 2026-02-20
**Status:** Proposed
**Decision:** Add `organization_id` FK column to all tenant-scoped tables. Filter in middleware.

**Alternatives considered:**
- Schema-per-tenant (too complex for early stage)
- Database-per-tenant (operational overhead)
- Row-level security in Postgres (harder to debug)

**Chosen:** Column-level filtering is simplest, well-understood, and sufficient for <1000 tenants.

---

## ADR-005: JWT + Refresh Token Authentication

**Date:** 2026-02-20
**Status:** Proposed
**Decision:** JWT access tokens (15min TTL) + refresh token rotation (7-day, httponly secure cookie).

**Rationale:** Matches spec requirement. Refresh token rotation prevents token theft escalation.

---

## ADR-006: Default Provider Choices

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Default transactional email provider to Resend and keep QuickBooks integration as a dedicated service module in commercialization phase.

**Rationale:** Fast implementation velocity with strong developer ergonomics and explicit accounting integration boundary.

**Consequence:** Add provider abstraction to avoid lock-in.

---

## ADR-007: Billing-First Baseline in Current Backend

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Implement Stripe billing baseline in existing FastAPI runtime now (plans, checkout, portal, webhook, status) before NestJS migration parity.

**Rationale:** Immediate path to monetization and user-requested smooth payment experience without waiting for full platform migration.

**Consequence:** Preserve API contract semantics during migration; re-implement equivalent module in `apps/api` later.

---

## ADR-008: Auth Baseline in Current Runtime

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Implement immediate FastAPI auth baseline (`signup`, `login`, `me`) with JWT access token for secure entry while broader tenant/RBAC platform work continues.

**Rationale:** User requested a real, legit login experience now (username/email + password) and it unblocks protected-route UX in parallel with platform migration.

**Consequence:** Add migration path to refresh token rotation and full session management in upcoming auth hardening slice.

---

## ADR-009: Billing and Login Launch Defaults Confirmed

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Launch with no trial, 7-day dunning retry window, and 3 billing tiers (Core/Ops/Enterprise); login tone set to premium executive with provided brand logo.

**Rationale:** Stakeholder selected these defaults explicitly for first release behavior and visual brand posture.

**Consequence:** Configure checkout and dunning implementation around these defaults; maintain logo-first branded login in web UI.

---

## ADR-010: Internal Operating System Priority Over Commercialization

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Prioritize internal team workflow unification (Buildertrend/QuickBooks/bank/vendor/payroll portal replacement) before subscription monetization features.

**Rationale:** Immediate business value is operational consolidation for Southeast Enterprise; SaaS packaging is a later phase.

**Consequence:** Stripe roadmap prioritizes AR/AP money movement first; subscription billing remains deferred backlog.

---

## ADR-011: Canonical Repository Decision

**Date:** 2026-02-20
**Status:** Accepted
**Decision:** Use `sc1212/erp` as the single canonical repository (Option A).

**Rationale:** Prevent active-repo divergence and keep CI/deploy/docs/migrations in one source of truth.

**Consequence:** `sc1212/SECG1` becomes mirror/archive unless explicitly changed later.
