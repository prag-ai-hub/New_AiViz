from rest_framework import serializers

from apps.video_gen.constants import ACTIVE_STATUSES, VideoJobStatus
from apps.video_gen.models import VideoJob


class VideoJobSerializer(serializers.ModelSerializer):
    queue_position = serializers.SerializerMethodField()

    class Meta:
        model = VideoJob
        fields = (
            "id",
            "prompt",
            "refined_prompt",
            "model",
            "status",
            "url",
            "seed_image_url",
            "duration_seconds",
            "queue_position",
            "error",
            "created_at",
            "started_at",
            "completed_at",
        )
        read_only_fields = fields

    def get_queue_position(self, obj: VideoJob) -> int:
        if obj.status not in ACTIVE_STATUSES:
            return 0
        return (
            VideoJob.objects.filter(
                status__in=tuple(ACTIVE_STATUSES),
                created_at__lt=obj.created_at,
            )
            .only("id")
            .count()
        )
