import sys

import pytest

from apps.accounts.models import Profile
from apps.accounts.services import issue_tokens
from apps.accounts.tests.factories import UserFactory
from apps.billing.models import Plan
from apps.image_gen.models import ImageAsset, ImageAssetStatus
from apps.image_gen.tests.factories import ImageAssetFactory

# Force submodule import so monkeypatching the dotted path resolves to the module.
import apps.image_gen.services.generate_and_persist  # noqa: F401
import apps.image_gen.services.refine_prompt  # noqa: F401
import apps.image_gen.api.serializers.image_asset  # noqa: F401

gap = sys.modules["apps.image_gen.services.generate_and_persist"]
rpm = sys.modules["apps.image_gen.services.refine_prompt"]
ia_serializer = sys.modules["apps.image_gen.api.serializers.image_asset"]


pytestmark = pytest.mark.django_db


# ----- helpers -----------------------------------------------------------------


def _auth(api_client, user):
    tokens = issue_tokens(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


def _wire_image_gen_settings(settings, *, fal_key="fal-test", openai_key="sk-test"):
    settings.IMAGE_GEN = {
        "FAL_KEY": fal_key,
        "MODEL": "fal-ai/flux/schnell",
        "OPENAI_REFINE_MODEL": "gpt-4o-mini",
        "R2_ACCOUNT_ID": "acc",
        "R2_ACCESS_KEY_ID": "ak",
        "R2_SECRET_ACCESS_KEY": "sk",
        "R2_BUCKET": "aiviz-assets",
    }
    settings.VIDYA_LM = {
        **getattr(settings, "VIDYA_LM", {}),
        "OPENAI_API_KEY": openai_key,
    }


def _patch_generate(monkeypatch):
    monkeypatch.setattr(
        gap,
        "fal_generate_image",
        lambda **kwargs: (
            b"\x89PNG fake",
            "image/png",
            "fal_test",
            "https://fal.media/files/fake.png",
        ),
    )


def _patch_refine(monkeypatch, prefix="refined: "):
    monkeypatch.setattr(
        gap,
        "refine_prompt",
        lambda *, user_prompt, style: f"{prefix}{user_prompt}",
    )


def _patch_upload(monkeypatch):
    monkeypatch.setattr(gap, "upload_bytes", lambda *, key, data, content_type: key)


def _patch_presign(monkeypatch, url="https://r2.example/signed.png"):
    monkeypatch.setattr(ia_serializer, "presign_get", lambda key: url)


# ----- /image/generate ---------------------------------------------------------


def test_generate_happy_path(api_client, monkeypatch, settings):
    _wire_image_gen_settings(settings)
    _patch_refine(monkeypatch)
    _patch_generate(monkeypatch)
    _patch_upload(monkeypatch)
    _patch_presign(monkeypatch)

    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(
        "/api/v1/image/generate",
        {"prompt": "a cat astronaut", "style": "cartoon"},
        format="json",
    )

    assert response.status_code == 201
    data = response.data
    assert data["status"] == "succeeded"
    assert data["style"] == "cartoon"
    assert data["url"] == "https://r2.example/signed.png"
    assert data["refined_prompt"] == "refined: a cat astronaut"

    row = ImageAsset.objects.get(user=user)
    assert row.status == ImageAssetStatus.SUCCEEDED
    assert row.r2_key.startswith(f"image-gen/{user.id}/")
    assert row.provider_request_id == "fal_test"
    assert row.refined_prompt == "refined: a cat astronaut"


def test_generate_anon_is_401(api_client):
    response = api_client.post(
        "/api/v1/image/generate", {"prompt": "x"}, format="json"
    )
    assert response.status_code == 401


def test_generate_503_when_keys_missing(api_client, settings):
    settings.IMAGE_GEN = {
        "FAL_KEY": "",
        "MODEL": "fal-ai/flux/schnell",
        "OPENAI_REFINE_MODEL": "gpt-4o-mini",
        "R2_ACCOUNT_ID": "",
        "R2_ACCESS_KEY_ID": "",
        "R2_SECRET_ACCESS_KEY": "",
        "R2_BUCKET": "",
    }
    settings.VIDYA_LM = {
        **getattr(settings, "VIDYA_LM", {}),
        "OPENAI_API_KEY": "",
    }
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/image/generate", {"prompt": "x"}, format="json"
    )
    assert response.status_code == 503


def test_generate_503_when_openai_key_missing(api_client, settings):
    """OpenAI is required at the config-readiness layer; even with FAL+R2 set
    we must 503 if OPENAI_API_KEY is blank (refine step is mandatory upstream)."""
    _wire_image_gen_settings(settings, openai_key="")
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/image/generate", {"prompt": "x"}, format="json"
    )
    assert response.status_code == 503


def test_generate_missing_prompt_is_400(api_client, settings):
    _wire_image_gen_settings(settings)
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/image/generate", {"prompt": ""}, format="json"
    )
    assert response.status_code == 400


def test_generate_invalid_style_is_400(api_client, settings):
    _wire_image_gen_settings(settings)
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/image/generate",
        {"prompt": "x", "style": "rococo"},
        format="json",
    )
    assert response.status_code == 400


def test_generate_normalises_width(api_client, monkeypatch, settings):
    _wire_image_gen_settings(settings)
    _patch_refine(monkeypatch)
    _patch_generate(monkeypatch)
    _patch_upload(monkeypatch)
    _patch_presign(monkeypatch)

    user = UserFactory()
    _auth(api_client, user)
    response = api_client.post(
        "/api/v1/image/generate",
        {"prompt": "x", "width": 999, "height": 1023},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["width"] == 960
    assert response.data["height"] == 960


def test_generate_quota_exceeded_returns_402(api_client, monkeypatch, settings):
    _wire_image_gen_settings(settings)
    _patch_refine(monkeypatch)
    _patch_generate(monkeypatch)
    _patch_upload(monkeypatch)
    _patch_presign(monkeypatch)

    free_plan = Plan.objects.get(code="free")
    limit = free_plan.combined_daily_limit or 5

    user = UserFactory()
    _auth(api_client, user)
    for _ in range(limit):
        r = api_client.post(
            "/api/v1/image/generate", {"prompt": "x"}, format="json"
        )
        assert r.status_code == 201

    response = api_client.post(
        "/api/v1/image/generate", {"prompt": "one too many"}, format="json"
    )
    assert response.status_code == 402


def test_refine_fallback_when_openai_fails(api_client, monkeypatch, settings):
    """If the OpenAI refine layer fails, the deterministic suffix kicks in and
    generation continues. We patch chat_completion at the refine module level
    so the real refine_prompt() runs through its fallback path."""
    _wire_image_gen_settings(settings)
    _patch_generate(monkeypatch)
    _patch_upload(monkeypatch)
    _patch_presign(monkeypatch)

    from infrastructure.openai import OpenAIError

    def _boom(*args, **kwargs):
        raise OpenAIError("openai is sad")

    monkeypatch.setattr(rpm, "chat_completion", _boom)

    user = UserFactory()
    _auth(api_client, user)

    response = api_client.post(
        "/api/v1/image/generate",
        {"prompt": "a cat astronaut", "style": "cartoon"},
        format="json",
    )

    assert response.status_code == 201
    row = ImageAsset.objects.get(user=user)
    assert row.status == ImageAssetStatus.SUCCEEDED
    # Deterministic fallback: "<prompt>, <STYLE_PROMPT_SUFFIX[cartoon]>"
    assert row.refined_prompt.startswith("a cat astronaut, ")
    assert "cartoon" in row.refined_prompt.lower()


# ----- /image/history ----------------------------------------------------------


def test_history_anon_is_401(api_client):
    response = api_client.get("/api/v1/image/history")
    assert response.status_code == 401


def test_history_only_returns_own(api_client, monkeypatch):
    _patch_presign(monkeypatch)
    mine = UserFactory()
    other = UserFactory()
    ImageAssetFactory.create_batch(3, user=mine)
    ImageAssetFactory(user=other)

    _auth(api_client, mine)
    response = api_client.get("/api/v1/image/history")
    assert response.status_code == 200
    assert response.data["count"] == 3
    assert all(a["url"] == "https://r2.example/signed.png" for a in response.data["results"])


def test_history_paginates(api_client, monkeypatch):
    _patch_presign(monkeypatch)
    user = UserFactory()
    ImageAssetFactory.create_batch(25, user=user)
    _auth(api_client, user)

    p1 = api_client.get("/api/v1/image/history")
    assert p1.status_code == 200
    assert p1.data["count"] == 25
    assert len(p1.data["results"]) == 20
    assert p1.data["next"] is not None

    p2 = api_client.get("/api/v1/image/history?page=2")
    assert p2.status_code == 200
    assert len(p2.data["results"]) == 5


# ----- /image/styles -----------------------------------------------------------


def test_styles_grade_7(api_client):
    user = UserFactory()
    Profile.objects.update_or_create(user=user, defaults={"grade": 7, "lang": "en"})
    _auth(api_client, user)
    response = api_client.get("/api/v1/image/styles")
    assert response.status_code == 200
    values = [item["value"] for item in response.data["items"]]
    assert "cartoon" in values
    assert "photo_real" not in values


def test_styles_grade_11(api_client):
    user = UserFactory()
    Profile.objects.update_or_create(user=user, defaults={"grade": 11, "lang": "en"})
    _auth(api_client, user)
    response = api_client.get("/api/v1/image/styles")
    assert response.status_code == 200
    values = [item["value"] for item in response.data["items"]]
    assert "photo_real" in values


def test_styles_no_profile_returns_safe_default(api_client):
    user = UserFactory()
    _auth(api_client, user)
    response = api_client.get("/api/v1/image/styles")
    assert response.status_code == 200
    values = [item["value"] for item in response.data["items"]]
    assert set(values) == {"cartoon", "watercolor", "crayon"}
