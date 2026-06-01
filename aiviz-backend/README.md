# aiviz-backend

Django 5 + DRF + Channels + Celery API for AIVIZ 2.0.

## Layout

```
apps/                       domain modules (one per AIVIZ tool or cross-cutting concern)
  accounts/                 User, Profile, ParentLink, OTP
  billing/                  Plan, Subscription, RazorpayOrder, UsageQuota
  gamification/             Streak, XPEvent, Badge, UserBadge
  notifications/            PushToken, FCM/APNs
  notebook/                 polymorphic NotebookEntry, Tag, search
  analytics/                ToolUsageEvent (parent dashboard, insights)
  common/                   shared base models, throttles, exception handler
  vidya_lm/                 Session, Message, SSE streaming
  image_gen/                ImageJob, Asset
  video_gen/                VideoJob (Celery)
  music_gen/                MusicJob (Celery)
  speech_tutor/             Conversation, PronunciationScore, CEFR tracker
  avatar/                   Simli orchestration (Channels)
  code_helper/              Snippet, history
  skillguru/                Syllabus, Quiz, Flashcard, Mindmap, AudioLesson

config/
  settings/{base,dev,prod,test}.py
  urls/{root,api_v1}.py
  asgi.py  wsgi.py  celery.py

core/                       cross-cutting engines (NOT per-app)
  auth/                     custom permissions, JWT helpers
  cache/                    cache decorators
  db/                       base models (TimeStampedModel, SoftDeleteModel)
  events/                   event bus + signal definitions
  exceptions/               domain exceptions
  flags/                    feature flag service
  middleware/               request id, profile loader
  offline/                  sync, queue, retry, conflict
  permissions/              IsOwner, IsParent, HasActivePlan
  quota/                    centralized @quota_required decorator + UsageQuota gateway
  responses/                envelope, pagination
  services/                 cross-cutting services
  storage/                  R2 / S3 wrappers
  tasks/                    base task class, retry policy
  throttling/               token-bucket via Redis
  tools/                    tool registry (source of truth for TOOL_KEYS)
  types/                    shared type aliases
  utils/                    small one-purpose helpers

infrastructure/             external SDK wrappers (one folder per provider)
  openai/  replicate/  elevenlabs/  razorpay/  simli/  msg91/
  redis/  websocket/  queues/  r2_storage/

tests/{unit,integration,e2e}
scripts/  docker/  requirements/  .github/workflows/
```

## Inside every Django app

```
apps/<app>/
  admin/             ModelAdmin classes split by model
  api/
    serializers/     one file per resource
    views/           one file per endpoint group; views are thin
    urls/            urlpatterns aggregated in __init__.py
    validators/      DRF + Zod-equivalent custom validators
  services/          business logic (functions, not god classes)
  selectors/         pure read queries — return querysets/dicts, never write
  repositories/      complex writes & transactions
  tasks/             Celery tasks
  models/            split per model
  permissions/       app-specific DRF permissions
  signals/           event subscribers; wire in apps.py via ready()
  constants/         enums, choices, string keys
  tests/             unit + integration
  utils/             one-purpose helpers
  apps.py
```

## Patterns

- **Selector** → `apps/<app>/selectors/get_user_sessions.py` (read DB only)
- **Service** → `apps/<app>/services/generate_ai_response.py` (business logic)
- **Repository** → `apps/<app>/repositories/save_streaming_messages.py` (complex writes)
- **Event-driven** — emit from `core/events/`, subscribe in `apps/<app>/signals/`
- **Tool registry** in `core/tools/` — never hardcode tool keys
- **Centralized quota** — apply `@quota_required("vidya_lm", cost=1)`; do not write per-feature quota logic

## File-size budget

| Type | Max lines |
|------|-----------|
| Service | 150 |
| View | 80 |
| Serializer | 80 |
| Selector | 60 |
| Repository | 120 |
| Task | 100 |
| Model | 120 |

## Run (dev)

```bash
pip install -r requirements/dev.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver  # or: docker compose -f docker/docker-compose.yml up
```

## Deploy (prod)

Compose: nginx → daphne (ASGI) + gunicorn (WSGI fallback) + celery worker + celery beat.
On Sanjeev's VPS, behind Let's Encrypt. Image built from `docker/Dockerfile`.
