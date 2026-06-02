"""Orchestrates refine → fal text-to-image (seed) → fal image-to-video → R2.

Runs inside a Celery task. Updates the `VideoJob` row through PENDING → RUNNING
→ SUCCEEDED / FAILED with `started_at`, `completed_at`, `seed_image_url`, `url`,
and `error` populated along the way.

Quota deduction is *not* done here — the calling Celery task increments only on
final success. R2 upload failures are non-fatal: we fall back to the fal CDN
URL (lives ~24 h) and log a warning.
"""

from __future__ import annotations

import logging
from uuid import uuid4

from django.conf import settings
from django.utils import timezone

from apps.image_gen.services.refine_prompt import refine_prompt
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.services.exceptions import VideoGenUnavailable
from infrastructure.fal_ai import (
    FalError,
    FalNotConfigured,
    generate_image as fal_generate_image,
    generate_video_from_image as fal_generate_video,
)
from infrastructure.r2_storage import R2Error, R2NotConfigured, upload_bytes

logger = logging.getLogger(__name__)


def _r2_configured(cfg: dict) -> bool:
    return all(
        cfg.get(k)
        for k in (
            "R2_ACCOUNT_ID",
            "R2_ACCESS_KEY_ID",
            "R2_SECRET_ACCESS_KEY",
            "R2_BUCKET",
        )
    )


def _seed_key(user_id: int) -> str:
    return f"video-gen/seed/{user_id}/{uuid4().hex}.png"


def _video_key(user_id: int) -> str:
    return f"video-gen/{user_id}/{uuid4().hex}.mp4"


def _save_failure(job: VideoJob, message: str) -> None:
    job.status = VideoJobStatus.FAILED
    job.error = message[:2000]
    job.completed_at = timezone.now()
    job.save(update_fields=["status", "error", "completed_at"])


def generate_and_persist(*, job: VideoJob) -> VideoJob:
    image_cfg = getattr(settings, "IMAGE_GEN", {})
    video_cfg = getattr(settings, "VIDEO_GEN", {})

    if not image_cfg.get("FAL_KEY"):
        _save_failure(job, "fal_not_configured")
        raise VideoGenUnavailable()

    seed_model = video_cfg.get("SEED_IMAGE_MODEL", "fal-ai/flux/schnell")
    video_model = video_cfg.get(
        "MODEL", "fal-ai/kling-video/v1/standard/image-to-video"
    )
    duration = int(video_cfg.get("DURATION_SECONDS", 5))

    job.status = VideoJobStatus.RUNNING
    job.started_at = timezone.now()
    job.model = video_model
    job.save(update_fields=["status", "started_at", "model"])

    # 1) Refine prompt (deterministic fallback baked in — never raises).
    refined = refine_prompt(user_prompt=job.prompt, style="")
    job.refined_prompt = refined
    job.save(update_fields=["refined_prompt"])

    # 2) Seed image via fal text-to-image.
    try:
        image_bytes, image_mime, _seed_request_id, seed_source_url = fal_generate_image(
            prompt=refined,
            model=seed_model,
            width=1024,
            height=576,  # 16:9 to match Kling default ratio
        )
    except FalNotConfigured as exc:
        _save_failure(job, "fal_not_configured")
        raise VideoGenUnavailable() from exc
    except FalError as exc:
        logger.exception("fal.ai seed image failed for video job %s", job.pk)
        _save_failure(job, f"seed_image: {exc}")
        raise

    # 3) Upload seed to R2 (optional). If skipped or R2 fails, keep the fal URL.
    seed_url_for_video = seed_source_url
    if _r2_configured(image_cfg):
        key = _seed_key(job.user_id)
        try:
            upload_bytes(key=key, data=image_bytes, content_type=image_mime)
        except (R2NotConfigured, R2Error) as exc:
            logger.warning(
                "Seed R2 upload failed for job %s, falling back to fal URL: %s",
                job.pk,
                exc,
            )
            job.seed_image_url = seed_source_url
        else:
            job.seed_image_r2_key = key
            job.seed_image_url = seed_source_url  # public-facing URL stays the fal one until presigned
    else:
        job.seed_image_url = seed_source_url

    job.save(update_fields=["seed_image_r2_key", "seed_image_url"])

    # 4) Image-to-video on fal.ai. Blocking; can take 30-60s.
    try:
        video_bytes, video_mime, video_request_id, video_source_url = (
            fal_generate_video(
                image_url=seed_url_for_video,
                model=video_model,
                prompt=refined,
                duration_seconds=duration,
            )
        )
    except FalNotConfigured as exc:
        _save_failure(job, "fal_not_configured")
        raise VideoGenUnavailable() from exc
    except FalError as exc:
        logger.exception("fal.ai video generation failed for job %s", job.pk)
        _save_failure(job, f"video: {exc}")
        raise

    job.provider_request_id = video_request_id

    # 5) Upload video to R2 (optional).
    if _r2_configured(image_cfg):
        key = _video_key(job.user_id)
        try:
            upload_bytes(key=key, data=video_bytes, content_type=video_mime)
        except (R2NotConfigured, R2Error) as exc:
            logger.warning(
                "Video R2 upload failed for job %s, falling back to fal URL: %s",
                job.pk,
                exc,
            )
            job.url = video_source_url
        else:
            job.r2_key = key
            job.url = video_source_url
    else:
        job.url = video_source_url

    job.status = VideoJobStatus.SUCCEEDED
    job.duration_seconds = float(duration)
    job.completed_at = timezone.now()
    job.save(
        update_fields=[
            "url",
            "r2_key",
            "provider_request_id",
            "status",
            "duration_seconds",
            "completed_at",
        ]
    )
    return job
