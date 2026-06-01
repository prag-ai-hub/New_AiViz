import pytest

from apps.accounts.services import issue_tokens

from .factories import UserFactory

URL = "/api/v1/auth/refresh"


@pytest.mark.django_db
class TestRefresh:
    def test_valid_refresh_rotates(self, api_client):
        user = UserFactory()
        tokens = issue_tokens(user)
        res = api_client.post(URL, {"refresh": tokens["refresh"]}, format="json")
        assert res.status_code == 200
        assert "access" in res.data
        assert "refresh" in res.data
        assert res.data["refresh"] != tokens["refresh"]

    def test_replayed_refresh_blacklisted(self, api_client):
        user = UserFactory()
        tokens = issue_tokens(user)
        # First use rotates and blacklists the original
        api_client.post(URL, {"refresh": tokens["refresh"]}, format="json")
        # Re-use of the original refresh must now fail
        res = api_client.post(URL, {"refresh": tokens["refresh"]}, format="json")
        assert res.status_code == 401

    def test_invalid_refresh_401(self, api_client):
        res = api_client.post(URL, {"refresh": "not-a-jwt"}, format="json")
        assert res.status_code == 401
