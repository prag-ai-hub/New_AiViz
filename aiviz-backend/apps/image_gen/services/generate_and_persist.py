"""Orchestrates OpenAI refine → fal.ai → (optional R2) → ImageAsset.

A row is created up-front with status="pending"; the refined prompt is
persisted as soon as it's available; on success the status flips to
"succeeded" with either the R2 key (when R2 is configured) OR the fal-hosted
URL recorded. On any failure it flips to "failed" with the error captured,
and `ImageGenUnavailable` (or the original exception for unexpected types)
is re-raised so the view can return the right status code.
"""

from __future__ import annotations

import logging
from uuid import uuid4

from django.conf import settings

from apps.image_gen.models import ImageAsset, ImageAssetStatus
from apps.image_gen.services.exceptions import ImageGenUnavailable
from apps.image_gen.services.refine_prompt import refine_prompt
from infrastructure.fal_ai import (
    FalError,
    FalNotConfigured,
    generate_image as fal_generate_image,
)
from infrastructure.r2_storage import R2Error, R2NotConfigured, upload_bytes

logger = logging.getLogger(__name__)


def _r2_key(user_id: int) -> str:
    return f"image-gen/{user_id}/{uuid4().hex}.png"


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


def generate_and_persist(
    *,
    user,
    prompt: str,
    style: str = "",
    width: int = 1024,
    height: int = 1024,
) -> ImageAsset:
    cfg = getattr(settings, "IMAGE_GEN", {})
    model = cfg.get("MODEL", "fal-ai/flux/schnell")

    asset = ImageAsset.objects.create(
        user=user,
        prompt=prompt,
        refined_prompt="",
        style=style or "",
        model=model,
        width=width,
        height=height,
        status=ImageAssetStatus.PENDING,
    )

    # 1) OpenAI prompt refinement (never raises — falls back to deterministic).
    refined = refine_prompt(user_prompt=prompt, style=style)
    asset.refined_prompt = refined
    asset.save(update_fields=["refined_prompt"])

    # 2) fal.ai image generation (single image).
    try:
        image_bytes, mime, request_id, source_url = fal_generate_image(
            prompt=refined,
            model=model,
            width=width,
            height=height,
        )
    except FalNotConfigured as exc:
        asset.status = ImageAssetStatus.FAILED
        asset.error = "fal_not_configured"
        asset.save(update_fields=["status", "error"])
        raise ImageGenUnavailable() from exc
    except FalError as exc:
        logger.exception("fal.ai generate failed for asset %s", asset.pk)
        asset.status = ImageAssetStatus.FAILED
        asset.error = str(exc)[:2000]
        asset.save(update_fields=["status", "error"])
        raise

    # 3) R2 upload (optional — skip if R2 not configured, use fal URL directly).
    asset.provider_request_id = request_id
    if _r2_configured(cfg):
        key = _r2_key(user.id)
        try:
            upload_bytes(key=key, data=image_bytes, content_type=mime)
        except R2NotConfigured as exc:
            # Shouldn't happen given the configured check above, but treat as
            # transient — fall through to the fal URL fallback.
            logger.warning("R2 reported not configured mid-flight: %s", exc)
            asset.image_url = source_url
        except R2Error as exc:
            logger.exception("R2 upload failed for asset %s", asset.pk)
            asset.status = ImageAssetStatus.FAILED
            asset.error = str(exc)[:2000]
            asset.save(update_fields=["status", "error"])
            raise
        else:
            asset.r2_key = key
    else:
        # Dev / lightweight setup: use fal's hosted URL directly.
        asset.image_url = source_url

    asset.status = ImageAssetStatus.SUCCEEDED
    asset.save(
        update_fields=[
            "r2_key",
            "image_url",
            "provider_request_id",
            "status",
        ]
    )
    return asset
