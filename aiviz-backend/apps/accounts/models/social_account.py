from django.conf import settings
from django.db import models

from apps.accounts.constants import SocialProvider


class SocialAccount(models.Model):
    """One row per (provider, subject) link. A user may attach multiple providers."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="social_accounts",
    )
    provider = models.CharField(max_length=16, choices=SocialProvider.choices)
    subject = models.CharField(max_length=255)  # Google's `sub` claim, etc.
    email_at_link = models.EmailField(blank=True)  # snapshot for audit
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "subject"], name="unique_provider_subject"
            ),
        ]
        indexes = [models.Index(fields=["user", "provider"])]

    def __str__(self) -> str:
        return f"SocialAccount<{self.provider}:{self.subject} → {self.user_id}>"
