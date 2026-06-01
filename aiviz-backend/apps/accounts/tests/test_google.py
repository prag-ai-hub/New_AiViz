import pytest

from apps.accounts.models import SocialAccount, User
from infrastructure.google_oauth import GoogleIdentity, GoogleTokenError

from .factories import UserFactory

URL = "/api/v1/auth/google"


def _identity(email="g@b.com", subject="sub-123", verified=True, name="Gita Rao"):
    return GoogleIdentity(
        subject=subject,
        email=email,
        email_verified=verified,
        name=name,
        picture="",
    )


@pytest.mark.django_db
class TestGoogleAuth:
    def test_new_user_created(self, api_client, monkeypatch):
        monkeypatch.setattr(
            "apps.accounts.services.verify_google.verify_id_token",
            lambda token: _identity(),
        )
        res = api_client.post(URL, {"id_token": "valid"}, format="json")
        assert res.status_code == 200
        assert res.data["created"] is True
        assert res.data["user"]["email"] == "g@b.com"
        assert res.data["user"]["is_email_verified"] is True
        assert "access" in res.data["tokens"]
        assert User.objects.filter(email="g@b.com").exists()
        assert SocialAccount.objects.filter(provider="google", subject="sub-123").exists()

    def test_existing_email_attaches_social_account(self, api_client, monkeypatch):
        UserFactory(email="g@b.com")
        monkeypatch.setattr(
            "apps.accounts.services.verify_google.verify_id_token",
            lambda token: _identity(),
        )
        res = api_client.post(URL, {"id_token": "valid"}, format="json")
        assert res.status_code == 200
        assert res.data["created"] is False
        assert SocialAccount.objects.filter(provider="google", subject="sub-123").count() == 1

    def test_idempotent_repeat_login(self, api_client, monkeypatch):
        monkeypatch.setattr(
            "apps.accounts.services.verify_google.verify_id_token",
            lambda token: _identity(),
        )
        api_client.post(URL, {"id_token": "valid"}, format="json")
        res = api_client.post(URL, {"id_token": "valid"}, format="json")
        assert res.status_code == 200
        assert res.data["created"] is False
        assert User.objects.filter(email="g@b.com").count() == 1
        assert SocialAccount.objects.count() == 1

    def test_unverified_email_400(self, api_client, monkeypatch):
        monkeypatch.setattr(
            "apps.accounts.services.verify_google.verify_id_token",
            lambda token: _identity(verified=False),
        )
        res = api_client.post(URL, {"id_token": "valid"}, format="json")
        assert res.status_code == 400
        assert res.data["error"]["code"] == "google_email_unverified"

    def test_invalid_token_400(self, api_client, monkeypatch):
        def boom(token):
            raise GoogleTokenError("bad signature")

        monkeypatch.setattr(
            "apps.accounts.services.verify_google.verify_id_token", boom
        )
        res = api_client.post(URL, {"id_token": "bogus"}, format="json")
        assert res.status_code == 400
        assert res.data["error"]["code"] == "google_token_invalid"
