"""Day 11: Notebook integration for video_gen.

Covers the auto-create signal on VideoJob succeed and the three new
continue-with transitions (video → chat / image / code).
"""

import pytest

from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.notebook.constants import SourceKind
from apps.notebook.models import NotebookEntry
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.tests.factories import VideoJobFactory

pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def test_succeeded_video_job_auto_creates_notebook_entry():
    user = UserFactory()
    job = VideoJobFactory(
        user=user,
        prompt="a tiny robot in a meadow",
        refined_prompt="a tiny robot in a sunlit meadow, cinematic",
        status=VideoJobStatus.SUCCEEDED,
    )

    entry = NotebookEntry.objects.get(user=user, source_kind=SourceKind.VIDEO_GEN)
    assert entry.title.startswith("a tiny robot")
    assert entry.summary == job.refined_prompt
    assert entry.source.pk == job.pk


def test_pending_video_job_does_not_create_entry():
    user = UserFactory()
    VideoJob.objects.create(
        user=user, prompt="x", status=VideoJobStatus.PENDING
    )
    assert not NotebookEntry.objects.filter(
        user=user, source_kind=SourceKind.VIDEO_GEN
    ).exists()


def test_continue_video_to_chat_returns_first_message(api_client):
    user = UserFactory()
    job = VideoJobFactory(
        user=user,
        prompt="a flying whale over Mumbai",
        status=VideoJobStatus.SUCCEEDED,
    )
    entry = NotebookEntry.objects.get(user=user, source_kind=SourceKind.VIDEO_GEN)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/notebook/entries/{entry.pk}/continue-with",
        {"target": "vidya_lm"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["route"] == "/tools/vidya-lm"
    assert "Tell me about this video" in response.data["params"]["firstMessage"]
    assert job.prompt in response.data["params"]["firstMessage"]


def test_continue_video_to_image_returns_prompt(api_client):
    user = UserFactory()
    job = VideoJobFactory(
        user=user,
        prompt="cyberpunk cat",
        status=VideoJobStatus.SUCCEEDED,
    )
    entry = NotebookEntry.objects.get(user=user, source_kind=SourceKind.VIDEO_GEN)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/notebook/entries/{entry.pk}/continue-with",
        {"target": "image_gen"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["route"] == "/tools/image-gen"
    assert response.data["params"]["prompt"] == job.prompt


def test_continue_video_to_code_returns_three_js_seed(api_client):
    user = UserFactory()
    VideoJobFactory(
        user=user,
        prompt="wave simulation",
        status=VideoJobStatus.SUCCEEDED,
    )
    entry = NotebookEntry.objects.get(user=user, source_kind=SourceKind.VIDEO_GEN)
    _auth(api_client, user)

    response = api_client.post(
        f"/api/v1/notebook/entries/{entry.pk}/continue-with",
        {"target": "code_helper"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["route"] == "/tools/code-helper"
    params = response.data["params"]
    assert params["language"] == "javascript"
    assert params["action"] == "suggest"
    assert "Three.js" in params["code"]
    assert "wave simulation" in params["code"]
