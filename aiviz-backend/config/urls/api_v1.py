from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.api.urls")),
    path("billing/", include("apps.billing.api.urls")),
    path("lm/", include("apps.vidya_lm.api.urls")),
    path("image/", include("apps.image_gen.api.urls")),
    path("video/", include("apps.video_gen.api.urls")),
    path("music/", include("apps.music_gen.api.urls")),
    path("speech/", include("apps.speech_tutor.api.urls")),
    path("code/", include("apps.code_helper.api.urls")),
    path("avatar/", include("apps.avatar.api.urls")),
    path("skillguru/", include("apps.skillguru.api.urls")),
    path("notebook/", include("apps.notebook.api.urls")),
    path("gamification/", include("apps.gamification.api.urls")),
    path("notifications/", include("apps.notifications.api.urls")),
    path("analytics/", include("apps.analytics.api.urls")),
]
