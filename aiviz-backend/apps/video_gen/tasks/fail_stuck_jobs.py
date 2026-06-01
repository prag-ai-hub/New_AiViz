"""Watchdog Celery beat task — bumps jobs stuck in RUNNING for too long to FAILED.

Catches Celery worker crashes / OOM kills that leave a job in a non-terminal
state forever. Safe to no-op on every healthy tick.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob

logger = logging.getLogger(__name__)


@shared_task(name="apps.video_gen.tasks.fail_stuck_jobs")
def fail_stuck_jobs() -> int:
    cfg = getattr(settings, "VIDEO_GEN", {})
    stuck_after = int(cfg.get("STUCK_AFTER_MINUTES", 10))
    cutoff = timezone.now() - timedelta(minutes=stuck_after)

    qs = VideoJob.objects.filter(
        status=VideoJobStatus.RUNNING,
        started_at__lt=cutoff,
    )
    updated = qs.update(
        status=VideoJobStatus.FAILED,
        error=f"provider timeout (>{stuck_after} min)",
        completed_at=timezone.now(),
    )
    if updated:
        logger.warning("fail_stuck_jobs flipped %s stuck job(s) to FAILED", updated)
    return updated
