from __future__ import annotations

from django.contrib.postgres.search import SearchQuery
from django.db import connection
from django.db.models import Q

from apps.notebook.models import NotebookEntry


def list_entries(
    *,
    user,
    source_kind: str | None = None,
    tag_slug: str | None = None,
    q: str | None = None,
):
    qs = NotebookEntry.objects.filter(user=user).prefetch_related("tags")
    if source_kind:
        qs = qs.filter(source_kind=source_kind)
    if tag_slug:
        qs = qs.filter(tags__slug=tag_slug)
    if q:
        q = q.strip()
        if q:
            if connection.vendor == "postgresql":
                qs = qs.filter(search_vector=SearchQuery(q, search_type="websearch"))
            else:
                qs = qs.filter(Q(title__icontains=q) | Q(summary__icontains=q))
    return qs.order_by("-updated_at").distinct()
