import sys

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory

import apps.vidya_lm.services.transcribe_audio  # noqa: F401

trm = sys.modules["apps.vidya_lm.services.transcribe_audio"]


pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _wav_upload(name="clip.wav", size=1024, content_type="audio/wav"):
    return SimpleUploadedFile(name, b"x" * size, content_type=content_type)


def test_transcribe_returns_text(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    monkeypatch.setattr(trm, "_transcribe", lambda path: "two plus two")

    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(
        "/api/v1/lm/transcribe",
        {"audio": _wav_upload()},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.data == {"text": "two plus two"}


def test_503_when_key_missing(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": ""}
    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(
        "/api/v1/lm/transcribe",
        {"audio": _wav_upload()},
        format="multipart",
    )
    assert response.status_code == 503


def test_anon_is_401(api_client):
    response = api_client.post(
        "/api/v1/lm/transcribe",
        {"audio": _wav_upload()},
        format="multipart",
    )
    assert response.status_code == 401


def test_missing_audio_is_400(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post("/api/v1/lm/transcribe", {}, format="multipart")
    assert response.status_code == 400


def test_oversized_audio_is_400(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    user = UserFactory()
    _auth(api_client, user)

    big = _wav_upload(size=11 * 1024 * 1024)
    response = api_client.post(
        "/api/v1/lm/transcribe", {"audio": big}, format="multipart"
    )
    assert response.status_code == 400


def test_unsupported_type_is_400(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    user = UserFactory()
    _auth(api_client, user)

    bad = SimpleUploadedFile("clip.txt", b"hi", content_type="text/plain")
    response = api_client.post(
        "/api/v1/lm/transcribe", {"audio": bad}, format="multipart"
    )
    assert response.status_code == 400
