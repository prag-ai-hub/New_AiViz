from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models

from apps.notebook.constants import SourceKind


class NotebookEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notebook_entries",
    )
    source_kind = models.CharField(
        max_length=16,
        choices=SourceKind.choices,
        db_index=True,
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    source = GenericForeignKey("content_type", "object_id")

    title = models.CharField(max_length=240, blank=True, default="")
    summary = models.TextField(blank=True, default="")
    tags = models.ManyToManyField(
        "notebook.Tag",
        related_name="entries",
        blank=True,
    )
    search_vector = SearchVectorField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["user", "-updated_at"]),
            models.Index(fields=["user", "source_kind", "-updated_at"]),
            GinIndex(fields=["search_vector"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "content_type", "object_id"],
                name="uq_notebook_per_source",
            ),
        ]

    def __str__(self) -> str:
        return f"NotebookEntry<{self.id} u={self.user_id} {self.source_kind}>"
