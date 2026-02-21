# PAYMENTS SYSTEM (Stripe) — Smooth UX + Reliable Backend

## What is now in place
- Billing API baseline module added (plans/checkout/portal/status/webhook) as infrastructure groundwork.
- Billing persistence models added for customer, subscription, and billing events.
- Stripe environment configuration added in app settings.

## Product direction update
- Subscription monetization is **later**.
- Near-term Stripe focus is in-app money movement for operations:
  - request payments (AR collection)
  - pay vendors/subs (AP disbursement workflows)

## API endpoints
- `GET /api/billing/plans`
- `POST /api/billing/checkout-session`
- `POST /api/billing/portal-session`
- `GET /api/billing/status?org_id=...`
- `POST /api/billing/webhook`

## UX principles for "smooth af"
1. One-click upgrade/downgrade from billing settings.
2. Immediate optimistic status in UI after checkout completion callback.
3. Clear payment-failed recovery with CTA to billing portal.
4. Transparent invoice and event timeline for finance admins.
5. No dead-end errors — always provide recoverable action.

## Reliability controls
- Webhook signature verification when secret configured.
- Event persistence for replay visibility/audit.
- Subscription status sync on create/update/delete webhook events.
- Promotion code support enabled on checkout.

## Recommended next implementation slice
1. Add AR payment-request flow (hosted payment link + status callback).
2. Add vendor payout workflow and approval controls.
3. Keep subscription controls in backlog for commercialization phase.
4. Add webhook retry dead-letter monitoring and payout reconciliation logs.


## Locked launch policies
- Trial: none.
- Dunning: retry failed renewals for 7 days.
- Launch plans: Core / Ops / Enterprise (3 tiers).
