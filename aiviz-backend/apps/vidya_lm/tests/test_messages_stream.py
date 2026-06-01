import pytest

from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.billing.models import Plan
from apps.vidya_lm.constants import MessageRole
import sys

import apps.vidya_lm.services.stream_assistant_reply  # noqa: F401  ensure submodule loaded

srm = sys.modules["apps.vidya_lm.services.stream_assistant_reply"]
from apps.vidya_lm.tests.factories import SessionFactory


pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _drain(streaming_response) -> str:
    return b"".join(streaming_response.streaming_content).decode("utf-8")


def _patch_stream_chat(monkeypatch, chunks):
    def fake_stream_chat(messages, *, model, temperature=0.7):
        for c in chunks:
            yield c

    monkeypatch.setattr(srm, "stream_chat", fake_stream_chat)


def test_post_message_streams_sse_and_persists_assistant(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["Hello ", "world", "!"])

    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages",
        {"content": "What is photosynthesis?"},
        format="json",
    )

    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/event-stream")
    assert response["X-Accel-Buffering"] == "no"

    body = _drain(response)
    assert "data: " in body
    assert "Hello " in body
    assert "[DONE]" in body

    msgs = list(session.messages.order_by("created_at"))
    assert [m.role for m in msgs] == [MessageRole.USER, MessageRole.ASSISTANT]
    assert msgs[1].content == "Hello world!"


def test_second_call_sees_prior_history(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}

    seen_payloads = []

    def fake_stream_chat(messages, *, model, temperature=0.7):
        seen_payloads.append(messages)
        yield "ok"

    monkeypatch.setattr(srm, "stream_chat", fake_stream_chat)

    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)

    r1 = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages", {"content": "first"}, format="json"
    )
    _drain(r1)
    r2 = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages", {"content": "second"}, format="json"
    )
    _drain(r2)

    assert len(seen_payloads) == 2
    second_payload = seen_payloads[1]
    user_msgs = [m for m in second_payload if m["role"] == "user"]
    assistant_msgs = [m for m in second_payload if m["role"] == "assistant"]
    assert any(m["content"] == "first" for m in user_msgs)
    assert any(m["content"] == "second" for m in user_msgs)
    assert any(m["content"] == "ok" for m in assistant_msgs)


def test_503_when_openai_key_missing(api_client, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": ""}

    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages",
        {"content": "hi"},
        format="json",
    )
    assert response.status_code == 503


def test_foreign_session_is_404(api_client):
    mine = UserFactory()
    other = UserFactory()
    foreign = SessionFactory(user=other)
    _auth(api_client, mine)

    response = api_client.post(
        f"/api/v1/lm/sessions/{foreign.pk}/messages",
        {"content": "hi"},
        format="json",
    )
    assert response.status_code == 404


def test_anon_is_401(api_client):
    session = SessionFactory()
    response = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages", {"content": "hi"}, format="json"
    )
    assert response.status_code == 401


def test_quota_exceeded_returns_402(api_client, monkeypatch, settings):
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["ok"])

    free_plan = Plan.objects.get(code="free")
    limit = free_plan.combined_daily_limit or 5

    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)

    for i in range(limit):
        r = api_client.post(
            f"/api/v1/lm/sessions/{session.pk}/messages",
            {"content": f"q{i}"},
            format="json",
        )
        _drain(r)

    response = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages",
        {"content": "one too many"},
        format="json",
    )
    assert response.status_code == 402


def test_accepts_text_event_stream_header(api_client, monkeypatch, settings):
    """Clients sending Accept: text/event-stream must not be rejected with 406."""
    settings.VIDYA_LM = {**settings.VIDYA_LM, "OPENAI_API_KEY": "test-key"}
    _patch_stream_chat(monkeypatch, ["ok"])

    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/lm/sessions/{session.pk}/messages",
        {"content": "hi"},
        format="json",
        HTTP_ACCEPT="text/event-stream",
    )
    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/event-stream")
    _drain(response)
