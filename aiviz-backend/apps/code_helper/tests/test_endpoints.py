import sys

import pytest

from apps.accounts.models import Profile
from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.billing.models import Plan
from apps.code_helper.models import CodeRequest

import apps.code_helper.services.stream_code_response  # noqa: F401

scrm = sys.modules["apps.code_helper.services.stream_code_response"]


pytestmark = pytest.mark.django_db


# ----- helpers -----------------------------------------------------------------


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _drain(streaming_response) -> str:
    return b"".join(streaming_response.streaming_content).decode("utf-8")


def _patch_stream_chat(monkeypatch, chunks):
    def fake_stream_chat(messages, *, model, temperature=0.3):
        for c in chunks:
            yield c

    monkeypatch.setattr(scrm, "stream_chat", fake_stream_chat)


def _payload(language="python", code="print('hi')", extra=""):
    return {"language": language, "code": code, "extra": extra}


# ----- /code/languages ---------------------------------------------------------


def test_languages_default_for_grade_7(api_client):
    user = UserFactory()
    Profile.objects.update_or_create(user=user, defaults={"grade": 7, "lang": "en"})
    _auth(api_client, user)

    response = api_client.get("/api/v1/code/languages")
    assert response.status_code == 200
    assert response.data["default"] == "html"
    values = [item["value"] for item in response.data["items"]]
    assert "python" in values and "scratch" in values


def test_languages_default_for_grade_11(api_client):
    user = UserFactory()
    Profile.objects.update_or_create(user=user, defaults={"grade": 11, "lang": "en"})
    _auth(api_client, user)

    response = api_client.get("/api/v1/code/languages")
    assert response.status_code == 200
    assert response.data["default"] == "python"


def test_languages_default_when_no_profile(api_client):
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.get("/api/v1/code/languages")
    assert response.status_code == 200
    assert response.data["default"] == "python"


def test_languages_requires_auth(api_client):
    assert api_client.get("/api/v1/code/languages").status_code == 401


# ----- /code/<action> streaming -----------------------------------------------


@pytest.mark.parametrize("action", ["suggest", "explain", "debug", "tests"])
def test_action_streams_and_persists(api_client, monkeypatch, settings, action):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["Hi ", "there", "!"])

    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(f"/api/v1/code/{action}", _payload(), format="json")

    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/event-stream")
    body = _drain(response)
    assert "data: " in body and "[DONE]" in body
    row = CodeRequest.objects.get(user=user, action=action)
    assert row.response == "Hi there!"
    assert row.language == "python"


def test_accepts_text_event_stream_header(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["ok"])
    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(
        "/api/v1/code/explain",
        _payload(),
        format="json",
        HTTP_ACCEPT="text/event-stream",
    )
    assert response.status_code == 200
    _drain(response)


def test_anon_is_401(api_client):
    response = api_client.post("/api/v1/code/explain", _payload(), format="json")
    assert response.status_code == 401


def test_503_when_key_missing(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": ""}
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post("/api/v1/code/explain", _payload(), format="json")
    assert response.status_code == 503


def test_missing_code_is_400(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/code/explain", {"language": "python", "code": ""}, format="json"
    )
    assert response.status_code == 400


def test_unknown_language_is_400(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/code/explain",
        {"language": "rust", "code": "fn main(){}"},
        format="json",
    )
    assert response.status_code == 400


def test_quota_exceeded_returns_402(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["ok"])

    free_plan = Plan.objects.get(code="free")
    limit = free_plan.combined_daily_limit or 5

    user = UserFactory()
    _auth(api_client, user)

    for _ in range(limit):
        r = api_client.post("/api/v1/code/explain", _payload(), format="json")
        _drain(r)

    response = api_client.post("/api/v1/code/explain", _payload(), format="json")
    assert response.status_code == 402
