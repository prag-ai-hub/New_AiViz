from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notebook.api.serializers import TagSerializer
from apps.notebook.models import NotebookEntry, Tag


class EntryTagsView(APIView):
    """PUT replaces the entry's tags with the supplied list (creating Tag rows
    as needed). Returns the resulting tag list."""

    permission_classes = [IsAuthenticated]

    def put(self, request, pk: int):
        entry = get_object_or_404(NotebookEntry, pk=pk, user=request.user)
        raw_names = request.data.get("names") or []
        if not isinstance(raw_names, list):
            return Response(
                {"detail": "`names` must be a list of strings."}, status=400
            )

        # Dedupe + normalise
        seen: set[str] = set()
        norm: list[tuple[str, str]] = []
        for name in raw_names:
            if not isinstance(name, str):
                continue
            cleaned = name.strip()
            if not cleaned:
                continue
            slug = slugify(cleaned)[:80]
            if not slug or slug in seen:
                continue
            seen.add(slug)
            norm.append((cleaned[:64], slug))

        with transaction.atomic():
            tag_objs = []
            for name, slug in norm:
                tag, _ = Tag.objects.get_or_create(
                    user=request.user,
                    slug=slug,
                    defaults={"name": name},
                )
                tag_objs.append(tag)
            entry.tags.set(tag_objs)

        return Response(TagSerializer(entry.tags.all(), many=True).data)
