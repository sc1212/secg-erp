# OPEN QUESTIONS — SECG ERP

Non-blocking questions logged during development. Sensible defaults chosen to keep building.

---

## OQ-001: TypeScript Backend Rewrite?

**Logged:** 2026-02-20
**Default chosen:** Keep Python/FastAPI. See ADR-001.
**Ask owner if:** They strongly prefer TypeScript everywhere and are willing to delay for the rewrite.

## OQ-002: Subscription Tiers & Pricing

**Logged:** 2026-02-20
**Default chosen:** 3 tiers (Starter/Pro/Enterprise) — details TBD in Phase 3.
**Needs answer before:** Stripe integration begins.

## OQ-003: Field User Financial Visibility

**Logged:** 2026-02-20
**Question:** Should field-role users see financial values (budgets, costs, margins) or only tasks/logs/photos?
**Default chosen:** Field users see task/schedule data only, NOT financial values.

## OQ-004: Change Order Approval Flow

**Logged:** 2026-02-20
**Question:** Can PMs approve change orders, or submit-only (owner/finance approves)?
**Default chosen:** PMs submit, owner/admin/finance approve.

## OQ-005: AIA vs Fixed SOV Billing

**Logged:** 2026-02-20
**Question:** Does SECG primarily use AIA progress billing, fixed SOV draws, or both?
**Default chosen:** Support both — the existing SOV and PayApp schemas already accommodate either.

## OQ-006: One Company per Workspace or Multi-Division?

**Logged:** 2026-02-20
**Question:** Is each SECG division (custom homes, multifamily) a separate org, or one org with divisions?
**Default chosen:** One org with division tagging (already present in P&L as `division` field).
**Needs answer before:** Multi-tenancy goes live for external customers.
