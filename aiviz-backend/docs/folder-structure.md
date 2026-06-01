# Folder structure — aiviz-backend

One-screen map. For deeper context see [architecture.md](architecture.md).

```
aiviz-backend/
├── manage.py
├── pyproject.toml
├── .env / .env.example
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── .github/workflows/
│   └── ci.yml
│
├── config/                       # Django project package
│   ├── settings/
│   │   ├── base.py               # shared
│   │   ├── dev.py                # DEBUG=True
│   │   ├── prod.py               # hardened
│   │   └── test.py               # in-memory sqlite, fast hasher
│   ├── urls/
│   │   ├── root.py               # /admin + /api/v1/
│   │   └── api_v1.py             # all app /api/v1/* mounts
│   ├── asgi.py                   # Channels entry
│   ├── wsgi.py                   # WSGI fallback
│   └── celery.py
│
├── core/                         # cross-cutting engines
│   ├── auth/                     # JWT helpers, base permissions
│   ├── cache/                    # cache decorators
│   ├── db/                       # base models (TimeStampedModel, SoftDelete)
│   ├── events/                   # event bus + signal definitions
│   ├── exceptions/               # exception handler + domain exceptions
│   ├── flags/                    # feature flags
│   ├── middleware/
│   │   └── request_id.py         # X-Request-Id per request
│   ├── offline/{sync,queue,retry,conflict}/
│   ├── permissions/              # IsOwner, IsParent, HasActivePlan
│   ├── quota/                    # @quota_required + UsageQuota gateway
│   ├── responses/                # envelope, pagination helpers
│   ├── services/                 # cross-cutting services
│   ├── storage/                  # R2 / S3 wrappers
│   ├── tasks/                    # base task class, retry policy
│   ├── throttling/               # Redis token bucket
│   ├── tools/                    # tool registry (SOURCE OF TRUTH)
│   ├── types/                    # shared type aliases
│   └── utils/                    # one-purpose helpers
│
├── infrastructure/               # external SDK adapters
│   ├── openai/  replicate/  elevenlabs/  razorpay/
│   ├── simli/   msg91/      r2_storage/
│   ├── redis/   websocket/  queues/
│
├── apps/                         # domain modules (15)
│   ├── accounts/                 # User, Profile, ParentLink, OTP
│   ├── billing/                  # Plan, Subscription, RazorpayOrder, UsageQuota
│   ├── gamification/             # Streak, XPEvent, Badge, UserBadge
│   ├── notifications/            # PushToken, FCM/APNs
│   ├── notebook/                 # polymorphic NotebookEntry, Tag, search
│   ├── analytics/                # ToolUsageEvent
│   ├── common/                   # shared base classes
│   ├── vidya_lm/                 # Session, Message, SSE streaming
│   ├── image_gen/                # ImageJob, Asset
│   ├── video_gen/                # VideoJob (Celery)
│   ├── music_gen/                # MusicJob (Celery)
│   ├── speech_tutor/             # Conversation, PronunciationScore
│   ├── avatar/                   # Simli (Channels)
│   ├── code_helper/              # Snippet
│   └── skillguru/                # Syllabus, Quiz, Flashcard, Mindmap
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Standard shape inside a domain app

```
apps/<app>/
├── apps.py                 # AppConfig, wire signals in ready()
├── models/                 # one file per model
├── api/
│   ├── serializers/        # one file per resource
│   ├── views/              # thin views
│   ├── urls/__init__.py    # urlpatterns
│   └── validators/
├── selectors/              # read-only DB queries
├── services/               # business logic
├── repositories/           # complex writes
├── tasks/                  # Celery tasks
├── signals/                # event subscribers
├── permissions/
├── admin/
├── constants/
├── utils/
├── tests/
└── migrations/
```

Each subfolder has an `__init__.py` and exports its public surface via the barrel.
