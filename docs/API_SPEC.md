# API SPEC

## Current baseline
- Existing FastAPI routes under `/api` for dashboard, projects, vendors, financials, CRM, team, admin/import.

## Target API design conventions
- Version prefix: `/v1`.
- Envelope:
  - success: `{ data, meta?, requestId }`
  - error: `{ error: { code, message, details? }, requestId }`
- Pagination: `page`, `pageSize`, `sort`, `order`, `filters`.
- Auth: bearer access token; refresh via secure cookie endpoint.
- Tenant context: resolved from active membership + org header/subdomain strategy.

## Planned endpoint groups
### Auth
- `POST /v1/auth/signup`
- `POST /v1/auth/login`
- `POST /v1/auth/logout` *(planned)*
- `POST /v1/auth/refresh` *(planned)*
- `POST /v1/auth/forgot-password` *(planned)*
- `POST /v1/auth/reset-password` *(planned)*
- `POST /v1/auth/verify-email` *(planned)*
- `GET /v1/auth/me`

### Organizations and RBAC
- `GET /v1/orgs`
- `POST /v1/orgs`
- `POST /v1/orgs/:id/invites`
- `POST /v1/orgs/:id/members/:memberId/roles`
- `GET /v1/permissions`

### Domain modules
- `GET /v1/projects`
- `GET /v1/projects/:id`
- `GET /v1/projects/:id/cost-codes`
- `GET /v1/projects/:id/budgets`
- `POST /v1/change-orders`
- `POST /v1/ap/invoices`
- `POST /v1/ar/draws`


### Billing / money movement
- `GET /v1/billing/plans` *(legacy baseline; commercialization-later)*
- `POST /v1/billing/checkout-session` *(legacy baseline; commercialization-later)*
- `POST /v1/billing/portal-session` *(legacy baseline; commercialization-later)*
- `GET /v1/billing/status`
- `POST /v1/billing/webhook`
- `POST /v1/payments/request` *(planned: AR collection)*
- `POST /v1/payouts/vendor` *(planned: vendor disbursement)*

Subscription-specific endpoints remain planned for later commercialization phase.

OpenAPI examples and schemas will be generated from NestJS decorators + DTOs and linked once module scaffolding lands.


Current FastAPI baseline includes `/api/auth/signup`, `/api/auth/login`, and `/api/auth/me`.
