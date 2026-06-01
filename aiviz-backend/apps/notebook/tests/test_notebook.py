import pytest
from django.contrib.contenttypes.models import ContentType

from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.code_helper.constants import CodeAction, CodeLanguage
from apps.code_helper.models import CodeRequest
from apps.image_gen.models import ImageAsset, ImageAssetStatus
from apps.notebook.constants import SourceKind
from apps.notebook.models import NotebookEntry, Tag
from apps.vidya_lm.constants import MessageRole
from apps.vidya_lm.models import Message, Session

pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _make_image(user, *, prompt="a cat astronaut", refined="", status=None):
    return ImageAsset.objects.create(
        user=user,
        prompt=prompt,
        refined_prompt=refined or "",
        model="fal-ai/flux/schnell",
        status=status or ImageAssetStatus.SUCCEEDED,
    )


def _make_code(user, *, code="print('hi')", response="explanation"):
    return CodeRequest.objects.create(
        user=user,
        action=CodeAction.EXPLAIN,
        language=CodeLanguage.PYTHON,
        code=code,
        response=response,
    )


def _make_session(user, *, title="New chat"):
    return Session.objects.create(user=user, title=title)


# ----- Auto-create signals -----------------------------------------------------


def test_image_asset_succeeded_creates_entry():
    user = UserFactory()
    asset = _make_image(user, prompt="photosynthesis diagram")
    entry = NotebookEntry.objects.get(user=user)
    assert entry.source_kind == SourceKind.IMAGE_GEN
    assert entry.object_id == asset.pk
    assert "photosynthesis" in entry.title.lower()


def test_image_asset_failed_does_not_create():
    user = UserFactory()
    _make_image(user, status=ImageAssetStatus.FAILED)
    assert NotebookEntry.objects.filter(user=user).count() == 0


def test_code_request_creates_when_response_set():
    user = UserFactory()
    req = _make_code(user, code="def x(): return 1", response="returns 1")
    entry = NotebookEntry.objects.get(user=user)
    assert entry.source_kind == SourceKind.CODE_HELPER
    assert entry.object_id == req.pk
    assert "python" in entry.title.lower() or "explain" in entry.title.lower()


def test_code_request_without_response_does_not_create():
    user = UserFactory()
    CodeRequest.objects.create(
        user=user,
        action=CodeAction.EXPLAIN,
        language=CodeLanguage.PYTHON,
        code="print('x')",
        response="",  # blank
    )
    assert NotebookEntry.objects.filter(user=user).count() == 0


def test_session_creates_entry_then_message_updates_summary():
    user = UserFactory()
    session = _make_session(user, title="Lesson: photosynthesis")
    entry = NotebookEntry.objects.get(user=user)
    assert entry.source_kind == SourceKind.VIDYA_LM
    assert entry.title == "Lesson: photosynthesis"
    assert entry.summary == ""

    Message.objects.create(
        session=session, role=MessageRole.ASSISTANT, content="Photosynthesis uses sunlight..."
    )
    entry.refresh_from_db()
    assert "Photosynthesis" in entry.summary


def test_deleting_source_removes_entry():
    user = UserFactory()
    asset = _make_image(user)
    assert NotebookEntry.objects.filter(user=user).count() == 1
    asset.delete()
    assert NotebookEntry.objects.filter(user=user).count() == 0


# ----- API: list ---------------------------------------------------------------


def test_list_entries_scoped_to_user(api_client):
    mine = UserFactory()
    other = UserFactory()
    _make_image(mine, prompt="a")
    _make_image(mine, prompt="b")
    _make_image(other, prompt="c")

    _auth(api_client, mine)
    response = api_client.get("/api/v1/notebook/entries")
    assert response.status_code == 200
    assert response.data["count"] == 2


def test_list_filter_by_tool(api_client):
    user = UserFactory()
    _make_image(user, prompt="img")
    _make_session(user, title="chat")
    _auth(api_client, user)

    r = api_client.get("/api/v1/notebook/entries?tool=image_gen")
    assert r.status_code == 200
    assert r.data["count"] == 1
    assert r.data["results"][0]["source_kind"] == "image_gen"

    r = api_client.get("/api/v1/notebook/entries?tool=vidya_lm")
    assert r.data["count"] == 1
    assert r.data["results"][0]["source_kind"] == "vidya_lm"


def test_list_filter_by_tag(api_client):
    user = UserFactory()
    _make_image(user, prompt="tagged")
    _make_image(user, prompt="untagged")
    _auth(api_client, user)

    entries = NotebookEntry.objects.filter(user=user).order_by("id")
    tagged = entries[0]
    tag = Tag.objects.create(user=user, name="lesson")
    tagged.tags.add(tag)

    r = api_client.get(f"/api/v1/notebook/entries?tag={tag.slug}")
    assert r.data["count"] == 1
    assert r.data["results"][0]["id"] == tagged.id


def test_list_search_matches_title_and_summary(api_client):
    user = UserFactory()
    _make_image(user, prompt="photosynthesis at dawn")
    _make_image(user, prompt="a sleeping cat")
    _auth(api_client, user)

    r = api_client.get("/api/v1/notebook/entries?q=photosynthesis")
    assert r.status_code == 200
    assert r.data["count"] == 1
    titles = {item["title"].lower() for item in r.data["results"]}
    assert any("photosynthesis" in t for t in titles)


# ----- API: detail + delete + tags --------------------------------------------


def test_entry_detail_renders_image_source(api_client):
    user = UserFactory()
    asset = _make_image(user, prompt="a cat", refined="a fluffy cat")
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.get(f"/api/v1/notebook/entries/{entry.id}")
    assert r.status_code == 200
    src = r.data["source"]
    assert src["id"] == asset.id
    assert src["prompt"] == "a cat"
    assert src["refined_prompt"] == "a fluffy cat"


def test_entry_detail_renders_chat_source(api_client):
    user = UserFactory()
    session = _make_session(user)
    Message.objects.create(session=session, role=MessageRole.USER, content="hi")
    Message.objects.create(session=session, role=MessageRole.ASSISTANT, content="Hello!")
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.get(f"/api/v1/notebook/entries/{entry.id}")
    src = r.data["source"]
    assert src["id"] == session.id
    assert src["message_count"] == 2
    assert src["last_assistant"] == "Hello!"


def test_delete_entry_keeps_source(api_client):
    user = UserFactory()
    asset = _make_image(user)
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.delete(f"/api/v1/notebook/entries/{entry.id}")
    assert r.status_code == 204
    assert not NotebookEntry.objects.filter(pk=entry.pk).exists()
    assert ImageAsset.objects.filter(pk=asset.pk).exists()


def test_put_tags_replaces_atomically(api_client):
    user = UserFactory()
    _make_image(user)
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r1 = api_client.put(
        f"/api/v1/notebook/entries/{entry.id}/tags",
        {"names": ["lesson", "chemistry"]},
        format="json",
    )
    assert r1.status_code == 200
    assert {t["slug"] for t in r1.data} == {"lesson", "chemistry"}

    r2 = api_client.put(
        f"/api/v1/notebook/entries/{entry.id}/tags",
        {"names": ["chemistry", "biology"]},
        format="json",
    )
    assert {t["slug"] for t in r2.data} == {"chemistry", "biology"}
    entry.refresh_from_db()
    assert {t.slug for t in entry.tags.all()} == {"chemistry", "biology"}


def test_tag_list_returns_only_users_tags(api_client):
    mine = UserFactory()
    other = UserFactory()
    Tag.objects.create(user=mine, name="lesson")
    Tag.objects.create(user=other, name="other")
    _auth(api_client, mine)

    r = api_client.get("/api/v1/notebook/tags")
    assert r.status_code == 200
    assert len(r.data) == 1
    assert r.data[0]["slug"] == "lesson"


# ----- Continue-with ---------------------------------------------------------------


def test_continue_chat_to_image(api_client):
    user = UserFactory()
    session = _make_session(user)
    Message.objects.create(
        session=session,
        role=MessageRole.ASSISTANT,
        content="Photosynthesis uses sunlight to make sugar.",
    )
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.post(
        f"/api/v1/notebook/entries/{entry.id}/continue-with",
        {"target": "image_gen"},
        format="json",
    )
    assert r.status_code == 200
    assert r.data["route"] == "/tools/image-gen"
    assert "Photosynthesis" in r.data["params"]["prompt"]


def test_continue_image_to_chat(api_client):
    user = UserFactory()
    _make_image(user, prompt="a cat astronaut")
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.post(
        f"/api/v1/notebook/entries/{entry.id}/continue-with",
        {"target": "vidya_lm"},
        format="json",
    )
    assert r.status_code == 200
    assert r.data["route"] == "/tools/vidya-lm"
    assert "a cat astronaut" in r.data["params"]["firstMessage"]


def test_continue_code_to_chat(api_client):
    user = UserFactory()
    _make_code(user, code="def add(a,b): return a+b")
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.post(
        f"/api/v1/notebook/entries/{entry.id}/continue-with",
        {"target": "vidya_lm"},
        format="json",
    )
    assert r.status_code == 200
    assert "def add" in r.data["params"]["firstMessage"]


def test_continue_invalid_target_is_400(api_client):
    user = UserFactory()
    _make_image(user)
    entry = NotebookEntry.objects.get(user=user)
    _auth(api_client, user)

    r = api_client.post(
        f"/api/v1/notebook/entries/{entry.id}/continue-with",
        {"target": "bogus_tool"},
        format="json",
    )
    assert r.status_code == 400


def test_continue_foreign_entry_is_404(api_client):
    mine = UserFactory()
    other = UserFactory()
    _make_image(other)
    foreign_entry = NotebookEntry.objects.get(user=other)
    _auth(api_client, mine)

    r = api_client.post(
        f"/api/v1/notebook/entries/{foreign_entry.id}/continue-with",
        {"target": "vidya_lm"},
        format="json",
    )
    assert r.status_code == 404


def test_anon_endpoints_are_401(api_client):
    assert api_client.get("/api/v1/notebook/entries").status_code == 401
    assert api_client.get("/api/v1/notebook/tags").status_code == 401
