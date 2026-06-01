"""Celery task that drives a single VideoJob from PENDING to a terminal state."""

from __future__ import annotations

import logging

from celery import shared_task
from django.utils import timezone

from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.services import generate_and_persist
from core.quota import increment_quota

logger = logging.getLogger(__name__)

TOOL_KEY = "video_gen"


@shared_task(name="apps.video_gen.tasks.start_generation", bind=True, max_retries=0)
def start_generation(self, job_id: int) -> None:
    try:
        job = VideoJob.objects.get(pk=job_id)
    except VideoJob.DoesNotExist:
        logger.warning("VideoJob %s vanished before task picked it up", job_id)
        return

    # If user already canceled while it was waiting in the queue, do nothing.
    if job.status == VideoJobStatus.CANCELED:
        return

    try:
        generate_and_persist(job=job)
    except Exception as exc:  # noqa: BLE001
        # generate_and_persist already wrote the failure row for known errors;
        # this catches anything that slipped through (e.g., uncaught DB errors).
        logger.exception("Video job %s crashed unexpectedly", job_id)
        job.refresh_from_db()
        if job.status not in (
            VideoJobStatus.FAILED,
            VideoJobStatus.CANCELED,
        ):
            job.status = VideoJobStatus.FAILED
            job.error = (job.error or str(exc))[:2000]
            job.completed_at = timezone.now()
            job.save(update_fields=["status", "error", "completed_at"])
        return

    # Success — deduct quota only now.
    increment_quota(job.user, TOOL_KEY, 1)
