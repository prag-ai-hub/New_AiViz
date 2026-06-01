from django.urls import path

from apps.video_gen.api.views import (
    GenerateView,
    JobCancelView,
    JobDetailView,
    JobsListView,
)

urlpatterns = [
    path("generate", GenerateView.as_view(), name="video-generate"),
    path("jobs", JobsListView.as_view(), name="video-jobs"),
    path("jobs/<int:pk>", JobDetailView.as_view(), name="video-job-detail"),
    path("jobs/<int:pk>/cancel", JobCancelView.as_view(), name="video-job-cancel"),
]
