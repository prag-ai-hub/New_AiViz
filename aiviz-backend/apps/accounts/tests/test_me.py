import pytest

URL = "/api/v1/auth/me"


@pytest.mark.django_db
class TestMe:
    def test_authenticated_returns_user_and_profile(self, auth_client):
        res = auth_client.get(URL)
        assert res.status_code == 200
        assert res.data["user"]["email"] == auth_client.user.email
        assert res.data["profile"] is not None
        assert res.data["profile"]["lang"] == "en"

    def test_anonymous_returns_401_envelope(self, api_client):
        res = api_client.get(URL)
        assert res.status_code == 401
        assert res.data["error"]["code"] == "not_authenticated"
        assert "request_id" in res.data["error"]
        assert "X-Request-Id" in res.headers
