from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notebook_tags",
    )
    name = models.CharField(max_length=64)
    slug = models.SlugField(max_length=80, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("user", "slug")]
        indexes = [models.Index(fields=["user", "slug"])]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:80]
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Tag<{self.user_id}:{self.slug}>"
