"""Billing API — Stripe checkout, portal, webhook, and status helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.deps import get_db
from backend.models.extended import BillingCustomer, BillingEvent, BillingSubscription

try:
    import stripe
except ImportError:  # pragma: no cover - handled at runtime with error
    stripe = None

router = APIRouter(prefix="/billing", tags=["Billing"])


class PlanOut(BaseModel):
    code: str
    name: str
    interval: str
    amount_cents: int
    max_users: int
    features: list[str]


class CheckoutRequest(BaseModel):
    org_id: str = Field(..., description="Tenant organization identifier")
    org_name: str
    email: str
    plan_code: str
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalRequest(BaseModel):
    org_id: str
    return_url: str


class BillingStatusOut(BaseModel):
    org_id: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    status: str = "none"
    current_period_end: Optional[datetime] = None


PLANS: dict[str, PlanOut] = {
    "core-monthly": PlanOut(
        code="core-monthly",
        name="Core Finance",
        interval="month",
        amount_cents=29900,
        max_users=10,
        features=["Dashboard", "Projects", "Budgets", "Basic AP/AR"],
    ),
    "ops-monthly": PlanOut(
        code="ops-monthly",
        name="Finance + Ops",
        interval="month",
        amount_cents=69900,
        max_users=35,
        features=["Everything in Core", "CO approvals", "Vendor scorecards", "Documents"],
    ),
    "enterprise-monthly": PlanOut(
        code="enterprise-monthly",
        name="Enterprise",
        interval="month",
        amount_cents=149900,
        max_users=150,
        features=["Everything in Ops", "QuickBooks sync", "Advanced analytics", "Priority support"],
    ),
}


def _require_stripe() -> None:
    if stripe is None:
        raise HTTPException(status_code=500, detail="Stripe SDK not installed. Add stripe to requirements.")
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY is not configured.")
    stripe.api_key = settings.stripe_secret_key


@router.get("/plans", response_model=list[PlanOut])
def list_plans():
    return list(PLANS.values())


@router.post("/checkout-session", response_model=CheckoutResponse)
def create_checkout_session(payload: CheckoutRequest, db: Session = Depends(get_db)):
    _require_stripe()

    if payload.plan_code not in PLANS:
        raise HTTPException(status_code=400, detail="Unknown plan code")

    plan = PLANS[payload.plan_code]

    customer = db.query(BillingCustomer).filter(BillingCustomer.org_id == payload.org_id).first()
    if customer and customer.stripe_customer_id:
        stripe_customer_id = customer.stripe_customer_id
    else:
        stripe_customer = stripe.Customer.create(
            email=payload.email,
            name=payload.org_name,
            metadata={"org_id": payload.org_id},
        )
        stripe_customer_id = stripe_customer["id"]
        if customer:
            customer.stripe_customer_id = stripe_customer_id
            customer.email = payload.email
            customer.org_name = payload.org_name
        else:
            db.add(BillingCustomer(
                org_id=payload.org_id,
                org_name=payload.org_name,
                email=payload.email,
                stripe_customer_id=stripe_customer_id,
            ))
        db.commit()

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=stripe_customer_id,
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": plan.name,
                    "description": "SECG ERP subscription",
                },
                "unit_amount": plan.amount_cents,
                "recurring": {"interval": plan.interval},
            },
            "quantity": 1,
        }],
        metadata={"org_id": payload.org_id, "plan_code": payload.plan_code},
        allow_promotion_codes=True,
    )

    db.add(BillingEvent(
        org_id=payload.org_id,
        event_type="checkout.session.created",
        stripe_event_id=session["id"],
        status="created",
        payload_json=str(session),
    ))
    db.commit()

    return CheckoutResponse(checkout_url=session["url"], session_id=session["id"])


@router.post("/portal-session")
def create_portal_session(payload: PortalRequest, db: Session = Depends(get_db)):
    _require_stripe()

    customer = db.query(BillingCustomer).filter(BillingCustomer.org_id == payload.org_id).first()
    if not customer or not customer.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No billing customer found for org")

    portal = stripe.billing_portal.Session.create(
        customer=customer.stripe_customer_id,
        return_url=payload.return_url,
    )
    return {"url": portal["url"]}


@router.get("/status", response_model=BillingStatusOut)
def get_billing_status(org_id: str, db: Session = Depends(get_db)):
    customer = db.query(BillingCustomer).filter(BillingCustomer.org_id == org_id).first()
    if not customer:
        return BillingStatusOut(org_id=org_id)

    subscription = db.query(BillingSubscription).filter(BillingSubscription.org_id == org_id).first()
    if not subscription:
        return BillingStatusOut(org_id=org_id, stripe_customer_id=customer.stripe_customer_id)

    return BillingStatusOut(
        org_id=org_id,
        stripe_customer_id=customer.stripe_customer_id,
        stripe_subscription_id=subscription.stripe_subscription_id,
        status=subscription.status,
        current_period_end=subscription.current_period_end,
    )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(default=None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    _require_stripe()

    payload = await request.body()

    # Always require signature verification — reject unsigned webhooks
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=500, detail="STRIPE_WEBHOOK_SECRET is not configured.")
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header.")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {exc}") from exc

    event_type = event["type"]
    obj = event["data"]["object"]
    metadata = obj.get("metadata", {}) if hasattr(obj, "get") else {}
    org_id = metadata.get("org_id")

    # If org_id not in event metadata, resolve from customer record
    if not org_id:
        stripe_customer_id = obj.get("customer")
        if stripe_customer_id:
            customer = db.query(BillingCustomer).filter(
                BillingCustomer.stripe_customer_id == stripe_customer_id
            ).first()
            if customer:
                org_id = customer.org_id

    db.add(BillingEvent(
        org_id=org_id,
        event_type=event_type,
        stripe_event_id=event.get("id"),
        status="received",
        payload_json=str(event),
    ))

    if event_type in {"customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"}:
        subscription_id = obj.get("id")
        if subscription_id:
            sub = db.query(BillingSubscription).filter(BillingSubscription.stripe_subscription_id == subscription_id).first()
            if not sub:
                sub = BillingSubscription(
                    org_id=org_id or "unknown",
                    stripe_subscription_id=subscription_id,
                )
                db.add(sub)
            if org_id:
                sub.org_id = org_id
            sub.stripe_customer_id = obj.get("customer")
            sub.status = obj.get("status", "unknown")
            sub.price_id = obj.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
            period_end = obj.get("current_period_end")
            sub.current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc) if period_end else None

    db.commit()
    return {"received": True, "event_type": event_type}
