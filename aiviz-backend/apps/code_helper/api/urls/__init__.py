from django.urls import path

from apps.code_helper.api.views import (
    DebugView,
    ExplainView,
    LanguagesView,
    SuggestView,
    TestsView,
)

app_name = "code_helper"

urlpatterns = [
    path("languages", LanguagesView.as_view(), name="languages"),
    path("suggest", SuggestView.as_view(), name="suggest"),
    path("explain", ExplainView.as_view(), name="explain"),
    path("debug", DebugView.as_view(), name="debug"),
    path("tests", TestsView.as_view(), name="tests"),
]
