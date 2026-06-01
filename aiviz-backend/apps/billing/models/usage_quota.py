from django.conf import settings
from django.db import models


class UsageQuota(models.Model):
    """One row per (user, tool_key, day). tool_key includes '_combined' for cross-tool counters."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage_quotas",
    )
    tool_key = models.CharField(max_length=32)
    day = models.DateField()
    count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "tool_key", "day"], name="unique_user_tool_day"),
        ]
        indexes = [models.Index(fields=["user", "day"])]

    def __str__(self) -> str:
        return f"Quota<{self.user_id} {self.tool_key} {self.day}={self.count}>"
