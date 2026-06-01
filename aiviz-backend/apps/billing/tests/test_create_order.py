import pytest

URL = "/api/v1/billing/orders"


@pytest.mark.django_db
class TestCreateOrder:
    def test_anonymous_401(self, api_client):
        res = api_client.post(URL, {"plan_code": "pro"}, format="json")
        assert res.status_code == 401

    def test_unknown_plan_400(self, auth_client):
        res = auth_client.post(URL, {"plan_code": "platinum"}, format="json")
        assert res.status_code == 400

    def test_free_plan_rejected(self, auth_client):
        # Serializer choices already exclude "free" — DRF returns 400.
        res = auth_client.post(URL, {"plan_code": "free"}, format="json")
        assert res.status_code == 400

    def test_payments_not_configured_503(self, auth_client, settings):
        # Default test settings have empty Razorpay keys → expect 503.
        settings.BILLING = {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": "", "RAZORPAY_WEBHOOK_SECRET": ""}
        res = auth_client.post(URL, {"plan_code": "pro"}, format="json")
        assert res.status_code == 503
        assert res.data["error"]["code"] == "payments_not_configured"

    def test_happy_path_with_mocked_razorpay(self, auth_client, monkeypatch):
        # Pretend Razorpay is configured + returns canned responses.
        monkeypatch.setattr(
            "apps.billing.services.create_order.create_order",
            lambda **kw: {"id": "order_fake_123", "currency": "INR"},
        )
        monkeypatch.setattr(
            "apps.billing.services.create_order.create_payment_link",
            lambda **kw: {"id": "plink_abc", "short_url": "https://rzp.io/i/abc"},
        )
        res = auth_client.post(URL, {"plan_code": "pro"}, format="json")
        assert res.status_code == 201, res.data
        assert res.data["razorpay_order_id"] == "order_fake_123"
        assert res.data["payment_link_short_url"] == "https://rzp.io/i/abc"
        assert res.data["amount_inr"] == 19900
        assert res.data["status"] == "created"
