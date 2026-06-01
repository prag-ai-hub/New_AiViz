import pytest


@pytest.mark.django_db
class TestListPlans:
    def test_public_returns_4_plans(self, api_client):
        res = api_client.get("/api/v1/billing/plans")
        assert res.status_code == 200
        codes = {p["code"] for p in res.data}
        assert codes == {"free", "pro", "family", "institution"}


@pytest.mark.django_db
class TestMySubscription:
    def test_anonymous_401(self, api_client):
        res = api_client.get("/api/v1/billing/subscription")
        assert res.status_code == 401

    def test_new_user_on_free(self, auth_client):
        res = auth_client.get("/api/v1/billing/subscription")
        assert res.status_code == 200
        assert res.data["plan_code"] == "free"
        assert res.data["status"] == "active"


@pytest.mark.django_db
class TestMyQuota:
    def test_free_user_snapshot(self, auth_client):
        res = auth_client.get("/api/v1/billing/quota")
        assert res.status_code == 200
        assert res.data["plan_code"] == "free"
        assert res.data["limits"]["_combined"] == {"used": 0, "limit": 5, "remaining": 5}
        # Free plan has no per-tool caps → unlimited per-tool (limit=None) but combined caps everything.
        assert res.data["limits"]["vidya_lm"]["limit"] is None
        assert res.data["limits"]["image_gen"]["limit"] is None
