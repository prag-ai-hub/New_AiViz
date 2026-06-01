import pytest

from apps.accounts.models import Profile
from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.vidya_lm.constants import MessageRole
from apps.vidya_lm.models import Message, Session
from apps.vidya_lm.tests.factories import MessageFactory, SessionFactory


pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def test_anon_list_returns_401(api_client):
    response = api_client.get("/api/v1/lm/sessions")
    assert response.status_code == 401


def test_list_only_returns_own_sessions(api_client):
    mine = UserFactory()
    other = UserFactory()
    SessionFactory.create_batch(2, user=mine)
    SessionFactory(user=other)

    _auth(api_client, mine)
    response = api_client.get("/api/v1/lm/sessions")

    assert response.status_code == 200
    assert len(response.data) == 2


def test_create_session_snapshots_profile(api_client):
    user = UserFactory()
    Profile.objects.update_or_create(
        user=user, defaults={"grade": 9, "board": "cbse", "lang": "hi"}
    )

    _auth(api_client, user)
    response = api_client.post("/api/v1/lm/sessions", {}, format="json")

    assert response.status_code == 201
    assert response.data["grade_snapshot"] == 9
    assert response.data["board_snapshot"] == "cbse"
    assert response.data["lang_snapshot"] == "hi"
    assert Session.objects.filter(user=user).count() == 1


def test_create_session_when_profile_missing(api_client):
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post("/api/v1/lm/sessions", {}, format="json")
    assert response.status_code == 201
    assert response.data["lang_snapshot"] == "en"


def test_retrieve_session_includes_messages(api_client):
    user = UserFactory()
    session = SessionFactory(user=user)
    MessageFactory(session=session, role=MessageRole.USER, content="hi")
    MessageFactory(session=session, role=MessageRole.ASSISTANT, content="hello")

    _auth(api_client, user)
    response = api_client.get(f"/api/v1/lm/sessions/{session.pk}")

    assert response.status_code == 200
    assert len(response.data["messages"]) == 2


def test_retrieve_foreign_session_is_404(api_client):
    mine = UserFactory()
    other = UserFactory()
    foreign = SessionFactory(user=other)

    _auth(api_client, mine)
    response = api_client.get(f"/api/v1/lm/sessions/{foreign.pk}")
    assert response.status_code == 404


def test_patch_title(api_client):
    user = UserFactory()
    session = SessionFactory(user=user)
    _auth(api_client, user)
    response = api_client.patch(
        f"/api/v1/lm/sessions/{session.pk}", {"title": "Photosynthesis"}, format="json"
    )
    assert response.status_code == 200
    session.refresh_from_db()
    assert session.title == "Photosynthesis"


def test_delete_session_cascades_messages(api_client):
    user = UserFactory()
    session = SessionFactory(user=user)
    MessageFactory.create_batch(2, session=session)
    _auth(api_client, user)

    response = api_client.delete(f"/api/v1/lm/sessions/{session.pk}")
    assert response.status_code == 204
    assert not Session.objects.filter(pk=session.pk).exists()
    assert Message.objects.filter(session_id=session.pk).count() == 0


def test_delete_foreign_session_is_404(api_client):
    mine = UserFactory()
    other = UserFactory()
    foreign = SessionFactory(user=other)
    _auth(api_client, mine)
    response = api_client.delete(f"/api/v1/lm/sessions/{foreign.pk}")
    assert response.status_code == 404
