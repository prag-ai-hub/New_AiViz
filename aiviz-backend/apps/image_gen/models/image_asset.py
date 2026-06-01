from django.conf import settings
from django.db import models

from apps.image_gen.constants import StylePreset


class ImageAssetStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SUCCEEDED = "succeeded", "Succeeded"
    FAILED = "failed", "Failed"


class ImageAsset(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="image_assets",
    )
    prompt = models.TextField()
    refined_prompt = models.TextField(blank=True, default="")
    style = models.CharField(
        max_length=32,
        choices=StylePreset.choices,
        blank=True,
        default="",
    )
    model = models.CharField(max_length=64, blank=True, default="")
    width = models.PositiveSmallIntegerField(default=1024)
    height = models.PositiveSmallIntegerField(default=1024)
    r2_key = models.CharField(max_length=255, blank=True, default="")
    image_url = models.URLField(max_length=1024, blank=True, default="")
    provider_request_id = models.CharField(max_length=64, blank=True, default="")
    status = models.CharField(
        max_length=12,
        choices=ImageAssetStatus.choices,
        default=ImageAssetStatus.PENDING,
    )
    error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self) -> str:
        return f"ImageAsset<{self.id} u={self.user_id} {self.status}>"
