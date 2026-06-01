from django.conf import settings
from django.db import models

from apps.accounts.constants import Board, Language, LearningStyle


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    grade = models.PositiveSmallIntegerField(null=True, blank=True)
    board = models.CharField(max_length=24, choices=Board.choices, null=True, blank=True)
    subjects = models.JSONField(default=list, blank=True)
    lang = models.CharField(max_length=4, choices=Language.choices, default=Language.EN)
    learning_style = models.CharField(
        max_length=16, choices=LearningStyle.choices, null=True, blank=True
    )
    goals = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["grade", "board"])]

    def __str__(self) -> str:
        return f"Profile<{self.user_id}>"
