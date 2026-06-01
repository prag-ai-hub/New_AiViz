from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from apps.notebook.api.serializers import NotebookEntrySerializer
from apps.notebook.models import NotebookEntry
from apps.notebook.selectors import list_entries


class NotebookPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class EntryListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotebookEntrySerializer
    pagination_class = NotebookPagination

    def get_queryset(self):
        return list_entries(
            user=self.request.user,
            source_kind=self.request.query_params.get("tool") or None,
            tag_slug=self.request.query_params.get("tag") or None,
            q=self.request.query_params.get("q") or None,
        )


class EntryDetailView(RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotebookEntrySerializer

    def get_queryset(self):
        return NotebookEntry.objects.filter(user=self.request.user).prefetch_related("tags")
