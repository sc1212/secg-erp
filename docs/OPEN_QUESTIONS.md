# OPEN QUESTIONS — SECG ERP

Non-blocking questions logged during development. Sensible defaults chosen to keep building.

---

## OQ-001: TypeScript Backend Rewrite?

**Logged:** 2026-02-20
**Default chosen:** Keep Python/FastAPI. See ADR-001.
**Ask owner if:** They strongly prefer TypeScript everywhere and are willing to delay for the rewrite.

## OQ-002: Workspace/Account Model

**Logged:** 2026-02-20
**Options:**
- A) One legal company per workspace
- B) One workspace can contain multiple legal entities/divisions
**Default chosen:** **B** for resale flexibility and consolidated reporting. One org with division tagging (already present in P&L as `division` field).
**Needs answer before:** Multi-tenancy goes live for external customers.

## OQ-003: Financial Visibility for Field Users

**Logged:** 2026-02-20
**Options:**
- A) Hide financial values completely
- B) Show budget-vs-actual summaries only
- C) Show full cost detail
**Default chosen:** **B** — Field users see task/schedule data and budget-vs-actual summaries only, NOT detailed financial values.

## OQ-004: Change Order Authority

**Logged:** 2026-02-20
**Options:**
- A) PM submit-only, finance/executive approve
- B) PM approve up to threshold, then executive
- C) PM full approval rights
**Default chosen:** **B** with threshold controls. PMs submit, owner/admin/finance approve above threshold.

## OQ-005: AIA vs Fixed SOV Billing

**Logged:** 2026-02-20
**Options:**
- A) AIA progress only
- B) Fixed SOV only
- C) Both
**Default chosen:** **C** — Support both. The existing SOV and PayApp schemas already accommodate either.

## OQ-006: Retainage Rule Defaults

**Logged:** 2026-02-20
**Options:**
- A) Single global percentage
- B) Project-level percentage override
- C) Line-item retainage
**Default chosen:** **B**.

## OQ-007: Subscription Tiers & Pricing

**Logged:** 2026-02-20
**Needs answer before:** Stripe integration begins.

---

## Resolved Selections (2026-02-21)

- Trial policy: **No trial**.
- Dunning policy: **Retry for 7 days**.
- Plan structure: **3 tiers**:
  - Core
  - Finance + Ops
  - Enterprise (integrations + advanced analytics).
- Logo source: **Stakeholder PNG provided** (to place at `docs/assets/se-logo.png`).
- Login tone: **Premium executive**.
- Repository choice: **`sc1212/erp` canonical** (see ADR-011).
