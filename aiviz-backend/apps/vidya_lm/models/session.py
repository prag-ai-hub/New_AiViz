from django.conf import settings
from django.db import models

from apps.vidya_lm.constants import SYSTEM_PROMPT_VERSION


class Session(models.Model):
    """A single chat with Vidya. Personalization snapshot (grade/board/lang) is frozen
    at creation so changing profile later doesn't shift behaviour mid-conversation."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lm_sessions",
    )
    title = models.CharField(max_length=120, default="New chat")

    grade_snapshot = models.PositiveSmallIntegerField(null=True, blank=True)
    board_snapshot = models.CharField(max_length=24, blank=True, default="")
    lang_snapshot = models.CharField(max_length=4, default="en")

    system_prompt_version = models.CharField(max_length=8, default=SYSTEM_PROMPT_VERSION)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["user", "-updated_at"])]
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Session<{self.id} {self.user_id} {self.title!r}>"
