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
