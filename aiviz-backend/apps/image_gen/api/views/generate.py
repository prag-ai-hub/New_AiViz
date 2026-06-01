from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.image_gen.api.serializers import (
    GenerateRequestSerializer,
    ImageAssetSerializer,
)
from apps.image_gen.services import ImageGenUnavailable, generate_and_persist
from core.quota import check_quota, increment_quota

TOOL_KEY = "image_gen"


def _config_ready(cfg: dict, openai_cfg: dict) -> bool:
    """The two non-negotiable keys are fal.ai (image generation) and OpenAI
    (prompt refinement). R2 is optional — if absent we serve the fal-hosted
    image URL directly."""
    if not cfg.get("FAL_KEY"):
        return False
    if not openai_cfg.get("OPENAI_API_KEY"):
        return False
    return True


class GenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cfg = getattr(settings, "IMAGE_GEN", {})
        openai_cfg = getattr(settings, "VIDYA_LM", {})
        if not _config_ready(cfg, openai_cfg):
            raise ImageGenUnavailable()

        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        check_quota(request.user, TOOL_KEY, 1)

        asset = generate_and_persist(
            user=request.user,
            prompt=payload["prompt"],
            style=payload.get("style", ""),
            width=payload["width"],
            height=payload["height"],
        )

        increment_quota(request.user, TOOL_KEY, 1)

        return Response(
            ImageAssetSerializer(asset).data,
            status=status.HTTP_201_CREATED,
        )
