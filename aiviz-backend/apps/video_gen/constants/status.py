from django.db import models


class VideoJobStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    RUNNING = "running", "Running"
    SUCCEEDED = "succeeded", "Succeeded"
    FAILED = "failed", "Failed"
    CANCELED = "canceled", "Canceled"


TERMINAL_STATUSES = frozenset(
    {VideoJobStatus.SUCCEEDED, VideoJobStatus.FAILED, VideoJobStatus.CANCELED}
)
ACTIVE_STATUSES = frozenset({VideoJobStatus.PENDING, VideoJobStatus.RUNNING})
