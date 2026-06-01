import hashlib
import hmac
import json

import pytest

from apps.billing.constants import OrderStatus, PlanCode
from apps.billing.models import RazorpayOrder, Subscription

from .factories import RazorpayOrderFactory

URL = "/api/v1/billing/webhook/razorpay"
SECRET = "test_webhook_secret_xyz"


def _sign(body: bytes) -> str:
    return hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()


def _paid_payload(order_id: str, payment_id: str = "pay_abc") -> bytes:
    return json.dumps(
        {
            "event": "payment_link.paid",
            "payload": {
                "payment": {"entity": {"id": payment_id, "order_id": order_id}},
                "payment_link": {"entity": {"order_id": order_id, "id": "plink_abc"}},
            },
        }
    ).encode("utf-8")


@pytest.fixture(autouse=True)
def _set_webhook_secret(settings):
    settings.BILLING = {
        "RAZORPAY_KEY_ID": "rzp_test_x",
        "RAZORPAY_KEY_SECRET": "secret_x",
        "RAZORPAY_WEBHOOK_SECRET": SECRET,
    }


@pytest.mark.django_db
class TestRazorpayWebhook:
    def test_invalid_signature_400(self, api_client):
        body = _paid_payload("order_xyz")
        res = api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE="garbage")
        assert res.status_code == 400
        assert res.data["error"]["code"] == "webhook_signature_invalid"

    def test_paid_event_activates_subscription(self, api_client, auth_client):
        order = RazorpayOrderFactory(user=auth_client.user, razorpay_order_id="order_xyz", plan_code=PlanCode.PRO)
        body = _paid_payload("order_xyz")
        sig = _sign(body)
        res = api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=sig)
        assert res.status_code == 200
        order.refresh_from_db()
        assert order.status == OrderStatus.PAID
        assert order.razorpay_payment_id == "pay_abc"
        sub = Subscription.objects.get(user=auth_client.user)
        assert sub.plan.code == PlanCode.PRO

    def test_idempotent_redelivery(self, api_client, auth_client):
        order = RazorpayOrderFactory(user=auth_client.user, razorpay_order_id="order_xyz", plan_code=PlanCode.PRO)
        body = _paid_payload("order_xyz")
        sig = _sign(body)
        api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=sig)
        res = api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=sig)
        assert res.status_code == 200
        assert res.data.get("ignored") is True
        order.refresh_from_db()
        assert order.status == OrderStatus.PAID  # unchanged

    def test_unknown_order_ignored(self, api_client):
        body = _paid_payload("order_unknown")
        sig = _sign(body)
        res = api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=sig)
        assert res.status_code == 200
        assert res.data["ignored"] is True

    def test_failed_event_marks_failed(self, api_client, auth_client):
        order = RazorpayOrderFactory(user=auth_client.user, razorpay_order_id="order_xyz", plan_code=PlanCode.PRO)
        body = json.dumps(
            {
                "event": "payment.failed",
                "payload": {"payment": {"entity": {"id": "pay_fail", "order_id": "order_xyz"}}},
            }
        ).encode()
        sig = _sign(body)
        res = api_client.post(URL, body, content_type="application/json", HTTP_X_RAZORPAY_SIGNATURE=sig)
        assert res.status_code == 200
        order.refresh_from_db()
        assert order.status == OrderStatus.FAILED
