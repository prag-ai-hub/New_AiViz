from django.urls import path

from apps.accounts.api.views import (
    GoogleAuthView,
    LearningStyleQuizView,
    LoginView,
    MeView,
    PatchProfileView,
    RefreshView,
    SignupView,
)

app_name = "accounts"

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="refresh"),
    path("me", MeView.as_view(), name="me"),
    path("me/profile", PatchProfileView.as_view(), name="me-profile"),
    path("me/learning-style-quiz", LearningStyleQuizView.as_view(), name="learning-style-quiz"),
    path("google", GoogleAuthView.as_view(), name="google"),
]
