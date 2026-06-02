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
    now = timezone.now()
    running_cutoff = now - timedelta(minutes=stuck_after)
    pending_cutoff = now - timedelta(minutes=5)

    running_qs = VideoJob.objects.filter(
        status=VideoJobStatus.RUNNING,
        started_at__lt=running_cutoff,
    )
    running_updated = running_qs.update(
        status=VideoJobStatus.FAILED,
        error=f"provider timeout (>{stuck_after} min)",
        completed_at=now,
    )

    # Also clean up jobs that never made it out of pending — usually means the
    # Celery broker was unreachable when the request was served.
    pending_qs = VideoJob.objects.filter(
        status=VideoJobStatus.PENDING,
        created_at__lt=pending_cutoff,
    )
    pending_updated = pending_qs.update(
        status=VideoJobStatus.FAILED,
        error="never picked up by worker (broker unreachable?)",
        completed_at=now,
    )

    total = running_updated + pending_updated
    if total:
        logger.warning(
            "fail_stuck_jobs flipped %s running + %s pending job(s) to FAILED",
            running_updated,
            pending_updated,
        )
    return total
