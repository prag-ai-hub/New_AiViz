import hashlib
import hmac

import razorpay
from django.conf import settings

from .exceptions import RazorpayError, RazorpayNotConfigured


def _client() -> razorpay.Client:
    key_id = settings.BILLING.get("RAZORPAY_KEY_ID")
    key_secret = settings.BILLING.get("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise RazorpayNotConfigured(
            "Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env before creating orders."
        )
    return razorpay.Client(auth=(key_id, key_secret))


def create_order(amount_paise: int, receipt: str, notes: dict) -> dict:
    """Returns the raw Razorpay order dict (contains id, amount, currency, status, ...)."""
    try:
        return _client().order.create(
            data={"amount": amount_paise, "currency": "INR", "receipt": receipt, "notes": notes}
        )
    except RazorpayError:
        raise
    except Exception as err:  # noqa: BLE001 — wrap any razorpay SDK error
        raise RazorpayError(f"Razorpay order.create failed: {err}") from err


def create_payment_link(
    amount_paise: int,
    customer_email: str,
    customer_contact: str | None,
    description: str,
    notes: dict,
) -> dict:
    """Returns dict with at minimum `id` and `short_url`."""
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "description": description,
        "customer": {"email": customer_email, "contact": customer_contact or ""},
        "notify": {"sms": False, "email": False},
        "reminder_enable": False,
        "notes": notes,
    }
    try:
        return _client().payment_link.create(payload)
    except RazorpayError:
        raise
    except Exception as err:  # noqa: BLE001
        raise RazorpayError(f"Razorpay payment_link.create failed: {err}") from err


def verify_webhook_signature(payload_bytes: bytes, signature_header: str) -> bool:
    """HMAC-SHA256(payload, webhook_secret) == signature_header (constant-time)."""
    secret = settings.BILLING.get("RAZORPAY_WEBHOOK_SECRET")
    if not secret:
        return False
    expected = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header or "")
