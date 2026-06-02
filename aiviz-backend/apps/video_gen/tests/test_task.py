"""Tests for the Celery task layer: start_generation + fail_stuck_jobs."""

import sys
from datetime import timedelta

import pytest
from django.utils import timezone

from apps.accounts.tests.factories import UserFactory
from apps.billing.models import UsageQuota
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.tasks import fail_stuck_jobs, start_generation
from apps.video_gen.tests.factories import VideoJobFactory

# Import the service module so we can monkeypatch its references.
import apps.video_gen.services.generate_and_persist  # noqa: F401

svc = sys.modules["apps.video_gen.services.generate_and_persist"]

pytestmark = pytest.mark.django_db


def _wire_settings(settings):
    settings.IMAGE_GEN = {
        "FAL_KEY": "fal-test",
        "MODEL": "fal-ai/flux/schnell",
        "OPENAI_REFINE_MODEL": "gpt-4o-mini",
        "R2_ACCOUNT_ID": "",
        "R2_ACCESS_KEY_ID": "",
        "R2_SECRET_ACCESS_KEY": "",
        "R2_BUCKET": "",
    }
    settings.VIDEO_GEN = {
        "MODEL": "fal-ai/kling-video/v1/standard/image-to-video",
        "SEED_IMAGE_MODEL": "fal-ai/flux/schnell",
        "DURATION_SECONDS": 5,
        "STUCK_AFTER_MINUTES": 10,
    }


def _patch_fal(monkeypatch):
    monkeypatch.setattr(
        svc,
        "fal_generate_image",
        lambda **kwargs: (
            b"\x89PNG fake-seed",
            "image/png",
            "fal_seed_test",
            "https://fal.media/files/seed.png",
        ),
    )
    monkeypatch.setattr(
        svc,
        "fal_generate_video",
        lambda **kwargs: (
            b"\x00\x00\x00\x18ftyp fake-mp4",
            "video/mp4",
            "fal_video_test",
            "https://fal.media/files/clip.mp4",
        ),
    )
    monkeypatch.setattr(
        svc,
        "refine_prompt",
        lambda *, user_prompt, style: f"refined: {user_prompt}",
    )


def test_start_generation_happy_path_flips_to_succeeded(monkeypatch, settings):
    _wire_settings(settings)
    _patch_fal(monkeypatch)

    user = UserFactory()
    job = VideoJob.objects.create(
        user=user, prompt="a tiny island", status=VideoJobStatus.PENDING
    )

    start_generation(job.pk)

    job.refresh_from_db()
    assert job.status == VideoJobStatus.SUCCEEDED
    assert job.url == "https://fal.media/files/clip.mp4"
    assert job.seed_image_url == "https://fal.media/files/seed.png"
    assert job.refined_prompt == "refined: a tiny island"
    assert job.started_at is not None
    assert job.completed_at is not None
    assert job.provider_request_id == "fal_video_test"
    # Quota deducted only on success.
    quota = UsageQuota.objects.get(user=user, tool_key="video_gen")
    assert quota.count == 1


def test_start_generation_fal_error_marks_failed(monkeypatch, settings):
    _wire_settings(settings)

    from infrastructure.fal_ai import FalError

    def _boom(**kwargs):
        raise FalError("fal exploded")

    monkeypatch.setattr(svc, "refine_prompt", lambda **kw: "refined")
    monkeypatch.setattr(svc, "fal_generate_image", _boom)

    user = UserFactory()
    job = VideoJob.objects.create(
        user=user, prompt="x", status=VideoJobStatus.PENDING
    )

    start_generation(job.pk)

    job.refresh_from_db()
    assert job.status == VideoJobStatus.FAILED
    assert "fal exploded" in job.error
    # Quota NOT deducted on failure.
    assert not UsageQuota.objects.filter(user=user, tool_key="video_gen").exists()


def test_start_generation_skips_canceled_jobs(monkeypatch, settings):
    """If the user cancels while the task is queued, we should no-op when picked up."""
    _wire_settings(settings)
    _patch_fal(monkeypatch)

    user = UserFactory()
    job = VideoJob.objects.create(
        user=user, prompt="x", status=VideoJobStatus.CANCELED
    )

    start_generation(job.pk)

    job.refresh_from_db()
    assert job.status == VideoJobStatus.CANCELED  # unchanged
    assert job.started_at is None  # never started
    assert not UsageQuota.objects.filter(user=user, tool_key="video_gen").exists()


def test_fail_stuck_jobs_clears_old_pending(settings):
    """Pending jobs >5min old (broker was unreachable) get flipped to failed."""
    _wire_settings(settings)
    user = UserFactory()
    stale = VideoJobFactory(user=user, status=VideoJobStatus.PENDING)
    VideoJob.objects.filter(pk=stale.pk).update(
        created_at=timezone.now() - timedelta(minutes=6)
    )

    fresh = VideoJobFactory(user=user, status=VideoJobStatus.PENDING)
    # fresh.created_at is "now"; should not be touched.

    count = fail_stuck_jobs()
    assert count == 1

    stale.refresh_from_db()
    fresh.refresh_from_db()
    assert stale.status == VideoJobStatus.FAILED
    assert "broker" in stale.error
    assert fresh.status == VideoJobStatus.PENDING


def test_fail_stuck_jobs_marks_long_running_failed(settings):
    _wire_settings(settings)
    user = UserFactory()
    stale = VideoJobFactory(
        user=user,
        status=VideoJobStatus.RUNNING,
    )
    stale.started_at = timezone.now() - timedelta(minutes=11)
    stale.save(update_fields=["started_at"])

    fresh = VideoJobFactory(
        user=user,
        status=VideoJobStatus.RUNNING,
    )
    fresh.started_at = timezone.now() - timedelta(minutes=2)
    fresh.save(update_fields=["started_at"])

    count = fail_stuck_jobs()
    assert count == 1

    stale.refresh_from_db()
    fresh.refresh_from_db()
    assert stale.status == VideoJobStatus.FAILED
    assert "timeout" in stale.error
    assert fresh.status == VideoJobStatus.RUNNING
