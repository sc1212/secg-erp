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

## ADR-002: Monorepo Structure

**Date:** 2026-02-20
**Status:** Proposed
**Decision:** Use a monorepo with pnpm workspaces + Turborepo for frontend orchestration, pip for Python backend.

**Structure:**
```
apps/api/     ← Python/FastAPI backend
apps/web/     ← Next.js frontend
packages/     ← Shared TS packages (types, utils)
docs/         ← All documentation
```

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
