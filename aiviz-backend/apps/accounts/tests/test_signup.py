import pytest

URL = "/api/v1/auth/signup"


@pytest.mark.django_db
class TestSignup:
    def test_happy_path_returns_user_and_tokens(self, api_client):
        res = api_client.post(URL, {"email": "a@b.com", "password": "Pa55word!"}, format="json")
        assert res.status_code == 201, res.data
        assert res.data["user"]["email"] == "a@b.com"
        assert res.data["user"]["role"] == "student"
        assert "access" in res.data["tokens"]
        assert "refresh" in res.data["tokens"]

    def test_duplicate_email_409(self, api_client):
        api_client.post(URL, {"email": "a@b.com", "password": "Pa55word!"}, format="json")
        res = api_client.post(URL, {"email": "a@b.com", "password": "Pa55word!"}, format="json")
        assert res.status_code == 409
        assert res.data["error"]["code"] == "duplicate_account"

    def test_weak_password_400(self, api_client):
        res = api_client.post(URL, {"email": "a@b.com", "password": "short"}, format="json")
        assert res.status_code == 400
        assert res.data["error"]["code"] == "invalid"

    def test_phone_optional_and_stored(self, api_client):
        res = api_client.post(
            URL,
            {"email": "p@b.com", "password": "Pa55word!", "phone": "+919876543210"},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["user"]["phone"] == "+919876543210"

    def test_bad_phone_rejected(self, api_client):
        res = api_client.post(
            URL,
            {"email": "p@b.com", "password": "Pa55word!", "phone": "9876543210"},
            format="json",
        )
        assert res.status_code == 400

    def test_invalid_role_rejected(self, api_client):
        res = api_client.post(
            URL,
            {"email": "p@b.com", "password": "Pa55word!", "role": "admin"},
            format="json",
        )
        assert res.status_code == 400
