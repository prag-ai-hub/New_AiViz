from django.urls import path

from apps.vidya_lm.api.views import (
    PostMessageView,
    SessionDetailView,
    SessionListCreateView,
    TranscribeView,
)

app_name = "vidya_lm"

urlpatterns = [
    path("sessions", SessionListCreateView.as_view(), name="sessions"),
    path("sessions/<int:pk>", SessionDetailView.as_view(), name="session-detail"),
    path("sessions/<int:session_pk>/messages", PostMessageView.as_view(), name="messages"),
    path("transcribe", TranscribeView.as_view(), name="transcribe"),
]
