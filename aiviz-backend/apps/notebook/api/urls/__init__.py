from django.urls import path

from apps.notebook.api.views import (
    ContinueWithView,
    EntryDetailView,
    EntryListView,
    EntryTagsView,
    TagListView,
)

app_name = "notebook"

urlpatterns = [
    path("entries", EntryListView.as_view(), name="entries"),
    path("entries/<int:pk>", EntryDetailView.as_view(), name="entry-detail"),
    path(
        "entries/<int:pk>/continue-with",
        ContinueWithView.as_view(),
        name="continue-with",
    ),
    path("entries/<int:pk>/tags", EntryTagsView.as_view(), name="entry-tags"),
    path("tags", TagListView.as_view(), name="tags"),
]
