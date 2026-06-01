from django.conf import settings
from django.db import models

from apps.video_gen.constants import VideoJobStatus

DEFAULT_VIDEO_MODEL = "fal-ai/kling-video/v1/standard/image-to-video"


class VideoJob(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_jobs",
    )
    prompt = models.TextField()
    refined_prompt = models.TextField(blank=True, default="")
    model = models.CharField(max_length=128, blank=True, default=DEFAULT_VIDEO_MODEL)
    duration_seconds = models.FloatField(null=True, blank=True, default=5.0)

    status = models.CharField(
        max_length=12,
        choices=VideoJobStatus.choices,
        default=VideoJobStatus.PENDING,
        db_index=True,
    )
    error = models.TextField(blank=True, default="")

    seed_image_url = models.URLField(max_length=1024, blank=True, default="")
    seed_image_r2_key = models.CharField(max_length=255, blank=True, default="")
    url = models.URLField(max_length=1024, blank=True, default="")
    r2_key = models.CharField(max_length=255, blank=True, default="")
    provider_request_id = models.CharField(max_length=64, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"VideoJob<{self.id} u={self.user_id} {self.status}>"
