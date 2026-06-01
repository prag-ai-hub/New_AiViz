from django.db import models

from apps.vidya_lm.constants import MessageRole


class Message(models.Model):
    session = models.ForeignKey(
        "vidya_lm.Session",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=16, choices=MessageRole.choices)
    content = models.TextField()
    model = models.CharField(max_length=48, blank=True, default="")
    tokens_in = models.PositiveIntegerField(default=0)
    tokens_out = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["session", "created_at"])]

    def __str__(self) -> str:
        preview = self.content[:40].replace("\n", " ")
        return f"Msg<{self.session_id} {self.role} {preview!r}>"
