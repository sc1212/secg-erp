# PERMISSIONS MATRIX

## Roles
- owner
- executive
- finance_manager
- project_manager
- estimator
- field_superintendent
- field_user
- external_accountant (optional)

## Core permission keys
- `org.manage`
- `users.manage`
- `projects.read`
- `projects.write`
- `budgets.read`
- `budgets.write`
- `cost_codes.manage`
- `change_orders.submit`
- `change_orders.approve`
- `commitments.manage`
- `ap.invoices.manage`
- `ar.draws.manage`
- `retainage.manage`
- `documents.read`
- `documents.write`
- `vendors.manage`
- `crm.manage`
- `dashboard.executive`
- `billing.manage`

## Default role mapping (initial)
| Permission | Owner | Exec | Finance | PM | Estimator | Field Super | Field |
|---|---:|---:|---:|---:|---:|---:|---:|
| org.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users.manage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| projects.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| projects.write | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| budgets.read | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ limited | ❌ |
| budgets.write | ✅ | ✅ | ✅ | ⚠️ scoped | ✅ | ❌ | ❌ |
| change_orders.submit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ limited |
| change_orders.approve | ✅ | ✅ | ✅ | ⚠️ threshold | ❌ | ❌ | ❌ |
| ap.invoices.manage | ✅ | ✅ | ✅ | ⚠️ submit-only | ❌ | ❌ | ❌ |
| ar.draws.manage | ✅ | ✅ | ✅ | ⚠️ prepare-only | ❌ | ❌ | ❌ |
| documents.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| documents.write | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ limited |
| dashboard.executive | ✅ | ✅ | ✅ | ⚠️ scoped | ❌ | ❌ | ❌ |

Notes:
- Thresholds and scope restrictions are implemented by policy rules, not only role mapping.
- Final matrix per endpoint will be documented alongside API contracts.
