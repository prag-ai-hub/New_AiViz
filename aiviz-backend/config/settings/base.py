from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parents[2]
env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-only-change-me")
DEBUG = False
ALLOWED_HOSTS: list[str] = env.list("ALLOWED_HOSTS", default=["*"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "channels",
    "corsheaders",
    # local apps
    "apps.accounts",
    "apps.billing",
    "apps.gamification",
    "apps.notifications",
    "apps.notebook",
    "apps.analytics",
    "apps.common",
    "apps.vidya_lm",
    "apps.image_gen",
    "apps.video_gen",
    "apps.music_gen",
    "apps.speech_tutor",
    "apps.avatar",
    "apps.code_helper",
    "apps.skillguru",
]

MIDDLEWARE = [
    "core.middleware.request_id.RequestIdMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=False)

ROOT_URLCONF = "config.urls.root"
ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {"default": env.db("DATABASE_URL", default="sqlite:///db.sqlite3")}
CACHES = {"default": env.cache("REDIS_URL", default="locmemcache://")}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

AUTHENTICATION_BACKENDS = [
    "apps.accounts.auth.backends.EmailOrPhoneBackend",
    "django.contrib.auth.backends.ModelBackend",
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

GOOGLE_OAUTH = {
    "CLIENT_IDS": env.list("GOOGLE_CLIENT_IDS", default=[]),
}

BILLING = {
    "RAZORPAY_KEY_ID": env("RAZORPAY_KEY_ID", default=""),
    "RAZORPAY_KEY_SECRET": env("RAZORPAY_KEY_SECRET", default=""),
    "RAZORPAY_WEBHOOK_SECRET": env("RAZORPAY_WEBHOOK_SECRET", default=""),
}

VIDYA_LM = {
    "OPENAI_API_KEY": env("OPENAI_API_KEY", default=""),
    "MODEL": env("OPENAI_MODEL", default="gpt-4o-mini"),
    "TEMPERATURE": env.float("OPENAI_TEMPERATURE", default=0.7),
}

IMAGE_GEN = {
    "FAL_KEY": env("FAL_KEY", default=""),
    "MODEL": env("IMAGE_MODEL", default="fal-ai/flux/schnell"),
    "OPENAI_REFINE_MODEL": env("IMAGE_REFINE_MODEL", default="gpt-4o-mini"),
    "R2_ACCOUNT_ID": env("R2_ACCOUNT_ID", default=""),
    "R2_ACCESS_KEY_ID": env("R2_ACCESS_KEY_ID", default=""),
    "R2_SECRET_ACCESS_KEY": env("R2_SECRET_ACCESS_KEY", default=""),
    "R2_BUCKET": env("R2_BUCKET", default="aiviz-assets"),
}

VIDEO_GEN = {
    "MODEL": env(
        "VIDEO_MODEL",
        default="fal-ai/kling-video/v1/standard/image-to-video",
    ),
    "SEED_IMAGE_MODEL": env(
        "VIDEO_SEED_IMAGE_MODEL",
        default="fal-ai/flux/schnell",
    ),
    "DURATION_SECONDS": env.int("VIDEO_DURATION_SECONDS", default=5),
    "STUCK_AFTER_MINUTES": env.int("VIDEO_STUCK_AFTER_MINUTES", default=10),
}

LANGUAGE_CODE = "en-in"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {"anon": "60/min", "user": "300/min"},
    "EXCEPTION_HANDLER": "core.exceptions.handler.exception_handler",
}

CELERY_BROKER_URL = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

CELERY_BEAT_SCHEDULE = {
    "video_gen.fail_stuck_jobs": {
        "task": "apps.video_gen.tasks.fail_stuck_jobs",
        "schedule": timedelta(minutes=1),
    },
}
