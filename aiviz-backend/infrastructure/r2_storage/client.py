"""Cloudflare R2 storage adapter via boto3 (S3-compatible).

Public API:
  - upload_bytes(key, data, content_type) -> str   # returns the key
  - presign_get(key, expires=518400) -> str        # signed GET URL (≤7 days)
  - delete(key) -> None
"""

from __future__ import annotations

from django.conf import settings

from .exceptions import R2Error, R2NotConfigured

# Max sigv4 presign TTL is 7 days; we default to 6 to leave room for clock skew.
DEFAULT_PRESIGN_TTL_SECONDS = 60 * 60 * 24 * 6


def _config() -> dict:
    cfg = getattr(settings, "IMAGE_GEN", {})
    required = ("R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET")
    missing = [k for k in required if not cfg.get(k)]
    if missing:
        raise R2NotConfigured(f"Missing R2 settings: {', '.join(missing)}")
    return cfg


def _client():
    cfg = _config()
    import boto3  # lazy
    from botocore.config import Config

    endpoint = f"https://{cfg['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=cfg["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=cfg["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _bucket() -> str:
    return _config()["R2_BUCKET"]


def upload_bytes(*, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """Upload bytes to R2 under `key`. Returns the same key."""
    client = _client()
    try:
        client.put_object(
            Bucket=_bucket(),
            Key=key,
            Body=data,
            ContentType=content_type,
        )
    except Exception as err:  # noqa: BLE001
        raise R2Error(f"R2 put_object failed for key={key}: {err}") from err
    return key


def presign_get(key: str, expires: int = DEFAULT_PRESIGN_TTL_SECONDS) -> str:
    """Return a signed GET URL for `key`. Default TTL is 6 days."""
    client = _client()
    try:
        return client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": _bucket(), "Key": key},
            ExpiresIn=expires,
        )
    except Exception as err:  # noqa: BLE001
        raise R2Error(f"R2 presign_get failed for key={key}: {err}") from err


def delete(key: str) -> None:
    client = _client()
    try:
        client.delete_object(Bucket=_bucket(), Key=key)
    except Exception as err:  # noqa: BLE001
        raise R2Error(f"R2 delete_object failed for key={key}: {err}") from err
