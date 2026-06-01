from django.conf import settings
from django.db import models

from apps.code_helper.constants import CodeAction, CodeLanguage


class CodeRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="code_requests",
    )
    action = models.CharField(max_length=16, choices=CodeAction.choices)
    language = models.CharField(max_length=16, choices=CodeLanguage.choices)
    code = models.TextField()
    extra = models.TextField(blank=True, default="")
    response = models.TextField(blank=True, default="")
    model = models.CharField(max_length=48, blank=True, default="")
    tokens_in = models.PositiveIntegerField(default=0)
    tokens_out = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self) -> str:
        return f"CodeRequest<{self.action} {self.language} u={self.user_id}>"
