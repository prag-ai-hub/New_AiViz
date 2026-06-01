import sys

import pytest

from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.billing.models import Plan
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.tests.factories import VideoJobFactory

import apps.video_gen.api.views.generate  # noqa: F401

gen_view = sys.modules["apps.video_gen.api.views.generate"]


pytestmark = pytest.mark.django_db


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _wire_video_settings(settings, *, fal_key="fal-test", openai_key="sk-test"):
    settings.IMAGE_GEN = {
        "FAL_KEY": fal_key,
        "MODEL": "fal-ai/flux/schnell",
        "OPENAI_REFINE_MODEL": "gpt-4o-mini",
        "R2_ACCOUNT_ID": "",
        "R2_ACCESS_KEY_ID": "",
        "R2_SECRET_ACCESS_KEY": "",
        "R2_BUCKET": "",
    }
    settings.VIDYA_LM = {
        **getattr(settings, "VIDYA_LM", {}),
        "OPENAI_API_KEY": openai_key,
    }
    settings.VIDEO_GEN = {
        "MODEL": "fal-ai/kling-video/v1/standard/image-to-video",
        "SEED_IMAGE_MODEL": "fal-ai/flux/schnell",
        "DURATION_SECONDS": 5,
        "STUCK_AFTER_MINUTES": 10,
    }


def _swallow_task(monkeypatch):
    """Replace start_generation.delay so it doesn't actually enqueue / run."""
    calls = []

    class _Stub:
        def delay(self, job_id):
            calls.append(job_id)

    monkeypatch.setattr(gen_view, "start_generation", _Stub())
    return calls


# ----- POST /video/generate ----------------------------------------------------


def test_generate_happy_path_returns_202_and_dispatches(api_client, monkeypatch, settings):
    _wire_video_settings(settings)
    calls = _swallow_task(monkeypatch)

    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/video/generate",
        {"prompt": "a calm sunset"},
        format="json",
    )

    assert response.status_code == 202
    data = response.data
    assert data["status"] == "pending"
    assert data["prompt"] == "a calm sunset"
    assert data["queue_position"] == 0  # only one job, no others ahead

    job = VideoJob.objects.get(user=user)
    assert job.status == VideoJobStatus.PENDING
    assert calls == [job.pk]


def test_generate_anon_is_401(api_client):
    response = api_client.post(
        "/api/v1/video/generate", {"prompt": "x"}, format="json"
    )
    assert response.status_code == 401


def test_generate_503_when_fal_missing(api_client, settings):
    _wire_video_settings(settings, fal_key="")
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/video/generate", {"prompt": "x"}, format="json"
    )
    assert response.status_code == 503


def test_generate_quota_exceeded_returns_402(api_client, monkeypatch, settings):
    """Free plan has combined_daily_limit=5; pre-fill the bucket to exhaustion
    and assert a fresh video request gets 402 before any task is queued."""
    _wire_video_settings(settings)
    calls = _swallow_task(monkeypatch)

    from apps.billing.models import UsageQuota
    from django.utils import timezone

    user = UserFactory()
    _auth(api_client, user)

    free_plan = Plan.objects.get(code="free")
    limit = free_plan.combined_daily_limit or 5
    UsageQuota.objects.create(
        user=user, tool_key="_combined", day=timezone.localdate(), count=limit
    )

    response = api_client.post(
        "/api/v1/video/generate", {"prompt": "a tiny island"}, format="json"
    )
    assert response.status_code == 402
    assert VideoJob.objects.filter(user=user).count() == 0
    assert calls == []  # task never dispatched


def test_generate_missing_prompt_is_400(api_client, settings):
    _wire_video_settings(settings)
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/video/generate", {"prompt": ""}, format="json"
    )
    assert response.status_code == 400


# ----- GET /video/jobs (list) --------------------------------------------------


def test_jobs_list_only_returns_own(api_client):
    mine = UserFactory()
    other = UserFactory()
    VideoJobFactory.create_batch(2, user=mine)
    VideoJobFactory(user=other)
    _auth(api_client, mine)

    response = api_client.get("/api/v1/video/jobs")
    assert response.status_code == 200
    assert response.data["count"] == 2


def test_jobs_list_anon_is_401(api_client):
    response = api_client.get("/api/v1/video/jobs")
    assert response.status_code == 401


# ----- GET /video/jobs/<id> ---------------------------------------------------


def test_job_detail_returns_queue_position(api_client):
    user = UserFactory()
    # Two pending jobs ahead, then ours.
    VideoJobFactory(user=user, status=VideoJobStatus.PENDING)
    VideoJobFactory(user=user, status=VideoJobStatus.RUNNING)
    mine = VideoJobFactory(user=user, status=VideoJobStatus.PENDING)
    _auth(api_client, user)

    response = api_client.get(f"/api/v1/video/jobs/{mine.pk}")
    assert response.status_code == 200
    assert response.data["queue_position"] == 2


def test_job_detail_queue_position_zero_when_terminal(api_client):
    user = UserFactory()
    job = VideoJobFactory(user=user, status=VideoJobStatus.SUCCEEDED)
    _auth(api_client, user)

    response = api_client.get(f"/api/v1/video/jobs/{job.pk}")
    assert response.status_code == 200
    assert response.data["queue_position"] == 0


def test_job_detail_foreign_user_is_404(api_client):
    mine = UserFactory()
    other_job = VideoJobFactory(user=UserFactory())
    _auth(api_client, mine)

    response = api_client.get(f"/api/v1/video/jobs/{other_job.pk}")
    assert response.status_code == 404


# ----- POST /video/jobs/<id>/cancel -------------------------------------------


def test_cancel_pending_job_succeeds(api_client):
    user = UserFactory()
    job = VideoJobFactory(user=user, status=VideoJobStatus.PENDING)
    _auth(api_client, user)

    response = api_client.post(f"/api/v1/video/jobs/{job.pk}/cancel")
    assert response.status_code == 200
    job.refresh_from_db()
    assert job.status == VideoJobStatus.CANCELED


def test_cancel_running_job_returns_409(api_client):
    user = UserFactory()
    job = VideoJobFactory(user=user, status=VideoJobStatus.RUNNING)
    _auth(api_client, user)

    response = api_client.post(f"/api/v1/video/jobs/{job.pk}/cancel")
    assert response.status_code == 409
    job.refresh_from_db()
    assert job.status == VideoJobStatus.RUNNING
