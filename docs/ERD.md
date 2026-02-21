# ERD (Initial)

## Existing domain entities (present)
- Clients, Projects, CostCodes, Commitments, ChangeOrders, SOVLines, PayApps, Invoices, Payments, Documents, AuditLogs, RetainageEntries, Vendors, Leads, Proposals, Payroll, etc.

## Missing platform entities (to add)
- Organizations
- Users
- Memberships
- Roles
- Permissions
- RolePermission join
- UserSession (refresh token family)
- PasswordResetToken
- EmailVerificationToken
- BillingCustomer / BillingSubscription / BillingEvent

Detailed ERD with PK/FK/index strategy will be expanded in auth foundation slice.
