# TEAM WORKFLOW — Claude + Codex on SECG ERP

**Date:** 2026-02-21
**Canonical Repo:** `sc1212/erp`
**Archive Repo:** `sc1212/SECG1` (mirror only — NO active feature work)

---

## BRANCHING MODEL

```
main (protected — PR gate required)
  │
  ├── claude/<feature-or-slice>     ← Claude Code work
  │   Examples:
  │   ├── claude/auth-login-system
  │   ├── claude/payment-hub
  │   ├── claude/dashboard-frontend
  │   └── claude/plaid-integration
  │
  └── codex/<feature-or-slice>      ← Codex work
      Examples:
      ├── codex/vendor-crud-endpoints
      ├── codex/crm-kanban-board
      └── codex/daily-reports-module
```

### Rules

1. **No direct commits to main** — all work goes through PRs
2. **Branch naming:** `claude/<feature>` or `codex/<feature>`
3. **PR required** with clear scope, test output, and changed-file summary
4. **Claim a slice before coding** — avoid overlap
5. **If touching the same area, coordinate first** via issue/PR comment
6. **Vertical-slice scoped** — DB/schema + API + UI + tests + docs per feature
7. **Rebase before merge** — pull latest main, resolve conflicts on branch

---

## SLICE ASSIGNMENTS (Current Priority)

| Slice | Agent | Branch | Status |
|-------|-------|--------|--------|
| Auth/Login + Protected Shell | Claude | `claude/auth-login-system` | Next up |
| Dashboard Frontend | Claude | `claude/dashboard-frontend` | After auth |
| Payment Hub (AR/AP) | Claude | `claude/payment-hub` | After dashboard |
| Projects CRUD + Frontend | TBD | TBD | Available |
| Vendor CRUD + Frontend | TBD | TBD | Available |
| QuickBooks Integration | TBD | TBD | Available |
| Financial Report Pages | TBD | TBD | Available |
| CRM Pipeline Frontend | TBD | TBD | Available |
| Plaid Bank Connection UI | TBD | TBD | Available |
| Materials/Procurement | TBD | TBD | Available |

---

## HOW CLAUDE + CODEX WORK TOGETHER

Both Claude Code and Codex can push to the same GitHub repo. They work on separate branches and merge via PRs. Here's how to avoid conflicts:

1. **Same repo, separate branches** — no conflicts possible until merge
2. **PR gate on main** — both agents' work gets reviewed before merging
3. **Vertical slices** — each agent owns a full feature (DB → API → UI → tests)
4. **No shared files modified simultaneously** — if both need to touch `models/core.py`, one goes first

### Conflict Resolution
- If both touch the same file, the second PR to merge resolves conflicts
- Rebase onto latest main before creating PR
- Prefer adding new files over modifying shared files
- New modules should have their own model/api/schema files (not appended to existing)

---

## PRIORITY ORDER (From Matt)

1. **Integration-first internal ops platform** (QB/bank/vendor/payroll consolidation)
2. **Auth/login + protected shell**
3. **Money movement workflows** (AR requests / AP payouts)
4. **Subscription packaging LATER** (not now)

---

## NOTES

- Bank connections: Build the Plaid UI + manual entry option, but don't actually connect live accounts until running in production
- Stripe: Set up in test/sandbox mode for development
- QuickBooks: Use sandbox company for development
- Gusto: Apply for partner API access (may take time)
