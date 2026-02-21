# OPEN QUESTIONS

## Q1. Workspace/account model
- Options:
  - A) One legal company per workspace
  - B) One workspace can contain multiple legal entities/divisions
- **Recommended default:** **B** for resale flexibility and consolidated reporting.

## Q2. Financial visibility for field users
- Options:
  - A) Hide financial values completely
  - B) Show budget-vs-actual summaries only
  - C) Show full cost detail
- **Recommended default:** **B**.

## Q3. Change order authority
- Options:
  - A) PM submit-only, finance/executive approve
  - B) PM approve up to threshold, then executive
  - C) PM full approval rights
- **Recommended default:** **B** with threshold controls.

## Q4. Billing modes for initial launch
- Options:
  - A) AIA progress only
  - B) Fixed SOV only
  - C) Both
- **Recommended default:** **C**.

## Q5. Retainage rule defaults
- Options:
  - A) Single global percentage
  - B) Project-level percentage override
  - C) Line-item retainage
- **Recommended default:** **B**.


## Resolved selections (2026-02-21)
- Trial policy: **A) No trial**.
- Dunning policy: **B) Retry for 7 days**.
- Plan structure: **B) 3 tiers (Core/Ops/Enterprise)**.
- Logo source: **Stakeholder PNG provided** (to place at `docs/assets/se-logo.png`).
- Login tone: **B) Premium executive**.

- Repository choice: **A) `sc1212/erp` canonical**.
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
