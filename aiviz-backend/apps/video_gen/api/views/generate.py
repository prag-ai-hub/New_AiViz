from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.video_gen.api.serializers import (
    GenerateVideoRequestSerializer,
    VideoJobSerializer,
)
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.video_gen.services import VideoGenUnavailable
from apps.video_gen.tasks import start_generation
from core.quota import check_quota

TOOL_KEY = "video_gen"


def _config_ready() -> bool:
    image_cfg = getattr(settings, "IMAGE_GEN", {})
    openai_cfg = getattr(settings, "VIDYA_LM", {})
    if not image_cfg.get("FAL_KEY"):
        return False
    if not openai_cfg.get("OPENAI_API_KEY"):
        return False
    return True


class GenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _config_ready():
            raise VideoGenUnavailable()

        serializer = GenerateVideoRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        active = VideoJob.objects.filter(
            user=request.user,
            status__in=[VideoJobStatus.PENDING, VideoJobStatus.RUNNING],
        ).first()
        if active is not None:
            return Response(
                {
                    "detail": "You already have a video in progress. Wait for it to finish before starting another.",
                    "active_job_id": active.pk,
                },
                status=status.HTTP_409_CONFLICT,
            )

        check_quota(request.user, TOOL_KEY, 1)

        job = VideoJob.objects.create(
            user=request.user,
            prompt=payload["prompt"],
            status=VideoJobStatus.PENDING,
        )
        start_generation.delay(job.pk)

        return Response(
            VideoJobSerializer(job).data,
            status=status.HTTP_202_ACCEPTED,
        )
