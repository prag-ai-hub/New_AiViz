import pytest

from .factories import UserFactory

URL = "/api/v1/auth/login"


@pytest.mark.django_db
class TestLogin:
    def test_email_login(self, api_client):
        UserFactory(email="a@b.com", password="Pa55word!")
        res = api_client.post(URL, {"identifier": "a@b.com", "password": "Pa55word!"}, format="json")
        assert res.status_code == 200
        assert "access" in res.data["tokens"]

    def test_phone_login(self, api_client):
        UserFactory(email="x@b.com", phone="+919876543210", password="Pa55word!")
        res = api_client.post(URL, {"identifier": "+919876543210", "password": "Pa55word!"}, format="json")
        assert res.status_code == 200

    def test_bad_password_401(self, api_client):
        UserFactory(email="a@b.com", password="Pa55word!")
        res = api_client.post(URL, {"identifier": "a@b.com", "password": "wrong"}, format="json")
        assert res.status_code == 401
        assert res.data["error"]["code"] == "invalid_credentials"

    def test_unknown_user_401(self, api_client):
        res = api_client.post(URL, {"identifier": "nope@b.com", "password": "x"}, format="json")
        assert res.status_code == 401

    def test_inactive_user_403(self, api_client):
        UserFactory(email="a@b.com", password="Pa55word!", is_active=False)
        res = api_client.post(URL, {"identifier": "a@b.com", "password": "Pa55word!"}, format="json")
        assert res.status_code == 403
        assert res.data["error"]["code"] == "user_inactive"
