import uuid

from django.db import transaction

from apps.billing.constants import OrderStatus
from apps.billing.models import Plan, RazorpayOrder
from infrastructure.razorpay import (
    RazorpayNotConfigured,
    create_order,
    create_payment_link,
)

from .exceptions import PaymentsNotConfigured, PlanNotFound


def create_razorpay_order(*, user, plan_code: str) -> RazorpayOrder:
    """Create a Razorpay order + payment link for `plan_code`, persist as RazorpayOrder."""
    try:
        plan = Plan.objects.get(code=plan_code, is_active=True)
    except Plan.DoesNotExist as err:
        raise PlanNotFound() from err

    if plan.price_inr in (None, 0):
        raise PlanNotFound(detail="That plan is not purchasable (free or sales-led).")

    receipt = f"aiviz-{user.id}-{uuid.uuid4().hex[:12]}"
    notes = {"user_id": str(user.id), "plan_code": plan_code, "receipt": receipt}

    try:
        rp_order = create_order(amount_paise=plan.price_inr, receipt=receipt, notes=notes)
        link = create_payment_link(
            amount_paise=plan.price_inr,
            customer_email=user.email,
            customer_contact=user.phone,
            description=f"AIVIZ {plan.name} subscription",
            notes={**notes, "razorpay_order_id": rp_order["id"]},
        )
    except RazorpayNotConfigured as err:
        raise PaymentsNotConfigured() from err

    with transaction.atomic():
        order = RazorpayOrder.objects.create(
            user=user,
            razorpay_order_id=rp_order["id"],
            razorpay_payment_link_id=link.get("id", ""),
            payment_link_short_url=link.get("short_url", ""),
            amount_inr=plan.price_inr,
            currency=rp_order.get("currency", "INR"),
            status=OrderStatus.CREATED,
            plan_code=plan_code,
            receipt_id=receipt,
        )
    return order
