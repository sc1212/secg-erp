# Integration OS Strategy (Internal Team First)

## Product direction (confirmed)
This platform is first an **internal operating system for Southeast Enterprise** (Matt + team), replacing day-to-day dependence on:
- Buildertrend
- QuickBooks-only workflows
- fragmented bank/credit card portals
- vendor portals (incl. Home Depot / Lowe's)
- payroll portals (e.g., Gusto)

Commercial SaaS packaging is later; immediate value is unified operations and finance control in one system.

## Stripe role (updated)
Stripe is not only for app subscriptions. Stripe capability is planned as:
1. Collect payments (AR) through app links/invoices.
2. Pay vendors/subcontractors from inside app workflows.
3. Maintain auditable payment timeline in ERP.

## Core integration lanes
1. Accounting lane: QuickBooks chart/accounts/txn sync + reconciliation.
2. Banking lane: account/transaction feeds from bank + credit card sources.
3. Procurement lane: vendor portal ingestion + cart-by-job support for field ops.
4. Payroll lane: Gusto data sync for labor cost and crew planning alignment.
5. Project ops lane: Buildertrend migration/bridge until full parity.

## First integration priority order
1. QuickBooks + bank/credit card feeds
2. Buildertrend bridge data
3. Gusto payroll sync
4. Home Depot/Lowe's/vendor portal procurement ingestion

## Guiding rule
If a feature does not improve internal daily operations immediately, it is lower priority than integration and workflow unification.
