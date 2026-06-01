"""Idempotent NotebookEntry upsert used by every auto-create signal."""

from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction

from apps.notebook.models import NotebookEntry


def upsert_entry(
    *,
    user,
    source,
    source_kind: str,
    title: str,
    summary: str = "",
) -> NotebookEntry:
    """Create or update the entry tied to (user, source). Returns the entry.

    Idempotent via the unique constraint `(user, content_type, object_id)`.
    """
    ct = ContentType.objects.get_for_model(source.__class__)

    defaults = {
        "source_kind": source_kind,
        "title": (title or "")[:240],
        "summary": (summary or "")[:8000],
    }

    try:
        with transaction.atomic():
            entry, created = NotebookEntry.objects.update_or_create(
                user=user,
                content_type=ct,
                object_id=source.pk,
                defaults=defaults,
            )
    except IntegrityError:
        # Race: another process beat us to it. Fetch the existing row and
        # apply the new title/summary.
        entry = NotebookEntry.objects.get(
            user=user, content_type=ct, object_id=source.pk
        )
        for k, v in defaults.items():
            setattr(entry, k, v)
        entry.save(update_fields=list(defaults.keys()))
    return entry
