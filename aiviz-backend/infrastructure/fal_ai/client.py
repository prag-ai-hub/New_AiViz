"""Thin adapter around the fal.ai SDK.

Public API:
    generate_image(prompt, model, width, height)
        -> (image_bytes, mime, request_id, source_url)

`source_url` is fal.ai's CDN-hosted URL. Callers that don't have R2 wired up
can store this URL directly and skip the upload step.

Single-image only (num_images=1 is hard-coded). Lazy imports so the rest of the
codebase loads cleanly even when `fal-client` isn't installed.
"""

from __future__ import annotations

import os

from django.conf import settings

from .exceptions import FalError, FalNotConfigured

DEFAULT_MIME = "image/png"


def _api_key() -> str:
    key = settings.IMAGE_GEN.get("FAL_KEY", "")
    if not key:
        raise FalNotConfigured("Set FAL_KEY in .env to call fal.ai.")
    return key


def _normalize_request_id(result: dict) -> str:
    for k in ("request_id", "requestId", "id"):
        v = result.get(k)
        if v:
            return str(v)
    return ""


DEFAULT_VIDEO_MIME = "video/mp4"


def generate_video_from_image(
    *,
    image_url: str,
    model: str,
    duration_seconds: int = 5,
    aspect_ratio: str = "16:9",
) -> tuple[bytes, str, str, str]:
    """Run image-to-video generation on fal.ai.

    Returns `(video_bytes, mime_type, request_id, source_url)`. Raises
    `FalNotConfigured` when the key is missing, `FalError` for any SDK / HTTP
    failure. Blocking call — invoke from a Celery task, never from a request thread.
    """
    key = _api_key()
    os.environ["FAL_KEY"] = key

    import fal_client  # lazy
    import requests  # lazy

    try:
        result = fal_client.subscribe(
            model,
            arguments={
                "image_url": image_url,
                "duration": str(duration_seconds),
                "aspect_ratio": aspect_ratio,
            },
            with_logs=False,
        )
    except Exception as err:  # noqa: BLE001
        raise FalError(f"fal.ai video subscribe failed: {err}") from err

    if not isinstance(result, dict):
        raise FalError(
            f"fal.ai returned unexpected payload type: {type(result)}"
        )

    video = result.get("video") or {}
    if isinstance(video, list):
        video = video[0] if video else {}
    url = video.get("url") if isinstance(video, dict) else None
    if not url:
        raise FalError(f"fal.ai video payload missing url: {result!r}")

    try:
        resp = requests.get(url, timeout=180)
        resp.raise_for_status()
    except Exception as err:  # noqa: BLE001
        raise FalError(f"Failed to download fal.ai video: {err}") from err

    mime = (
        resp.headers.get("Content-Type", DEFAULT_VIDEO_MIME).split(";")[0].strip()
        or DEFAULT_VIDEO_MIME
    )
    return resp.content, mime, _normalize_request_id(result), url


def generate_image(
    *,
    prompt: str,
    model: str,
    width: int = 1024,
    height: int = 1024,
) -> tuple[bytes, str, str, str]:
    """Run a single text-to-image generation on fal.ai.

    Returns `(image_bytes, mime_type, request_id, source_url)`. Raises
    `FalNotConfigured` when the key is missing, `FalError` for any SDK / HTTP
    failure.
    """
    key = _api_key()
    # The SDK reads FAL_KEY from the environment.
    os.environ["FAL_KEY"] = key

    import fal_client  # lazy
    import requests  # lazy

    try:
        result = fal_client.subscribe(
            model,
            arguments={
                "prompt": prompt,
                "image_size": {"width": width, "height": height},
                "num_images": 1,  # single image per request — non-negotiable
                "enable_safety_checker": True,
            },
            with_logs=False,
        )
    except Exception as err:  # noqa: BLE001
        raise FalError(f"fal.ai subscribe failed: {err}") from err

    if not isinstance(result, dict):
        raise FalError(f"fal.ai returned unexpected payload type: {type(result)}")

    images = result.get("images") or []
    if not images:
        raise FalError("fal.ai returned no images.")

    first = images[0]
    url = first.get("url") if isinstance(first, dict) else None
    if not url:
        raise FalError(f"fal.ai image entry missing url: {first!r}")

    try:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
    except Exception as err:  # noqa: BLE001
        raise FalError(f"Failed to download fal.ai image: {err}") from err

    mime = resp.headers.get("Content-Type", DEFAULT_MIME).split(";")[0].strip() or DEFAULT_MIME
    return resp.content, mime, _normalize_request_id(result), url
