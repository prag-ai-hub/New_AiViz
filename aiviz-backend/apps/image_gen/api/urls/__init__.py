from django.urls import path

from apps.image_gen.api.views import GenerateView, HistoryView, StylesView

app_name = "image_gen"

urlpatterns = [
    path("generate", GenerateView.as_view(), name="generate"),
    path("history", HistoryView.as_view(), name="history"),
    path("styles", StylesView.as_view(), name="styles"),
]
