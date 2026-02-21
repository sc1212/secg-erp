# Repository Strategy

## Canonical repo selection (confirmed)
- Selected option: **A**
- **Canonical repository:** `sc1212/erp`
- Secondary repo (`sc1212/SECG1`) should be treated as archive/mirror only unless explicitly re-designated.

## Operating rule
- All feature work, docs, migrations, and release tags ship from `sc1212/erp`.
- Do not split active development across both repositories.

## Why this matters
Running both repos as active creates:
- drift in schema/docs,
- conflicting deployment behavior,
- duplicated bug triage and review overhead.

## Immediate actions
1. Point CI and deployment webhooks to `sc1212/erp` only.
2. Add a README note in `sc1212/SECG1` that it is non-canonical.
3. If needed, mirror from `sc1212/erp` to `sc1212/SECG1` as read-only sync.
