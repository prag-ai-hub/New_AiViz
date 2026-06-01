import json
import logging

from django.db import transaction

from apps.billing.constants import OrderStatus
from apps.billing.models import RazorpayOrder
from infrastructure.razorpay import verify_webhook_signature

from .activate_subscription import activate_subscription
from .exceptions import WebhookSignatureInvalid

log = logging.getLogger(__name__)

_PAID_EVENTS = {"payment.captured", "payment_link.paid", "order.paid"}
_FAILED_EVENTS = {"payment.failed", "payment_link.expired", "payment_link.cancelled"}


def process_razorpay_webhook(*, raw_body: bytes, signature_header: str) -> dict:
    """Verify signature, parse event, dispatch. Returns a small dict summarising what happened.

    Idempotent: re-delivered events with the same razorpay_payment_id are no-ops."""

    if not verify_webhook_signature(raw_body, signature_header):
        raise WebhookSignatureInvalid()

    payload = json.loads(raw_body.decode("utf-8"))
    event = payload.get("event", "")

    # Razorpay nests the payload under `payload.<entity>.entity`.
    rp_order_id = _extract_order_id(payload)
    rp_payment_id = _extract_payment_id(payload)

    if not rp_order_id:
        return {"ignored": True, "reason": "no order id in payload", "event": event}

    try:
        order = RazorpayOrder.objects.get(razorpay_order_id=rp_order_id)
    except RazorpayOrder.DoesNotExist:
        log.warning("Webhook for unknown order %s (event=%s)", rp_order_id, event)
        return {"ignored": True, "reason": "unknown order", "event": event}

    # Idempotency — if we've already marked this payment paid, skip.
    if order.status == OrderStatus.PAID and order.razorpay_payment_id:
        return {"ignored": True, "reason": "already paid", "event": event}

    if event in _PAID_EVENTS:
        with transaction.atomic():
            order.status = OrderStatus.PAID
            if rp_payment_id:
                order.razorpay_payment_id = rp_payment_id
            order.raw_webhook_payload = payload
            order.save()
            activate_subscription(user=order.user, plan_code=order.plan_code)
        return {"event": event, "status": "paid", "user_id": order.user_id}

    if event in _FAILED_EVENTS:
        order.status = OrderStatus.FAILED
        order.raw_webhook_payload = payload
        order.save()
        return {"event": event, "status": "failed"}

    return {"ignored": True, "reason": "unhandled event", "event": event}


def _extract_order_id(payload: dict) -> str:
    for entity in ("payment", "payment_link", "order"):
        rec = payload.get("payload", {}).get(entity, {}).get("entity", {})
        if rec.get("order_id"):
            return rec["order_id"]
        if entity == "order" and rec.get("id"):
            return rec["id"]
    return ""


def _extract_payment_id(payload: dict) -> str:
    payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
    return payment.get("id", "")
