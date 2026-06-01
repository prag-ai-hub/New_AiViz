import pytest

from apps.accounts.tests.factories import UserFactory
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob

pytestmark = pytest.mark.django_db


def test_video_job_defaults():
    user = UserFactory()
    job = VideoJob.objects.create(user=user, prompt="a tiny island")
    assert job.status == VideoJobStatus.PENDING
    assert job.model.startswith("fal-ai/")
    assert job.duration_seconds == 5.0
    assert job.url == ""
    assert job.seed_image_url == ""
    assert job.refined_prompt == ""
    assert job.created_at is not None
    assert job.started_at is None
    assert job.completed_at is None


def test_video_job_str_repr():
    user = UserFactory()
    job = VideoJob.objects.create(user=user, prompt="x")
    assert str(job).startswith("VideoJob<")
    assert "pending" in str(job)
