# Architecture — aiviz-backend

## Shape

**Domain-driven modular monolith.** One Django app per business domain
(`apps/<app>/`). Cross-cutting engines (auth, quota, events, flags, tool registry,
offline, storage) live in `core/`. External SDK adapters live in `infrastructure/`.
Per-environment config in `config/settings/`.

```
config/        settings split, URLs, asgi/wsgi, celery
core/          cross-cutting engines (NOT per-app)
infrastructure/ wrappers around external providers
apps/          15 domain modules
tests/         repo-wide tests
```

## Layering inside a domain app

```
apps/<app>/
  models/         one file per model
  api/
    serializers/  one file per resource
    views/        thin — one endpoint group per file (≤80 lines)
    urls/         urlpatterns aggregated in __init__.py
    validators/   custom field/object validators
  selectors/      READ-ONLY queries — never write
  services/       business logic (functions, not god classes)
  repositories/   complex writes & transactions
  tasks/          Celery tasks
  signals/        event subscribers, wired in apps.py.ready()
  permissions/    app-specific DRF permissions
  admin/          ModelAdmin per model
  constants/      enums, choices, string keys
  utils/          small one-purpose helpers
  tests/
```

## Three patterns to know

- **Selector** — `apps/<app>/selectors/get_user_sessions.py`
  Pure read query, returns querysets/dicts. No writes. No side-effects.
- **Service** — `apps/<app>/services/generate_ai_response.py`
  Business logic. Receives plain args, returns plain data, raises domain exceptions.
- **Repository** — `apps/<app>/repositories/save_streaming_messages.py`
  Complex multi-row writes inside `transaction.atomic`. The only layer that should
  call `.save()` on multiple models in one breath.

## Event bus

Emit from `core/events/`; subscribe in `apps/<app>/signals/`. Events:

- `MessageGenerated` (vidya_lm)
- `ImageCreated` (image_gen)
- `VideoReady` (video_gen)
- `XPAdded`, `BadgeUnlocked` (gamification)
- `SubscriptionActivated` (billing)
- `QuotaExceeded` (core/quota)

Day 1: bus interfaces are in `core/events/`. Real wiring lands when the first
subscriber is needed.

## Centralized engines

- `core/quota/` — `@quota_required(tool_key, cost)` decorator over views.
  Per-feature quota logic is forbidden.
- `core/tools/` — single source of truth for the AI tool registry.
- `core/offline/` — `sync/`, `queue/`, `retry/`, `conflict/`.
- `core/flags/` — feature flags.
- `core/throttling/` — Redis token bucket beyond DRF's defaults.

## Realtime

Channels via `config/asgi.py`. Consumers live next to the feature
(`apps/vidya_lm/consumers/`, `apps/speech_tutor/consumers/`, `apps/avatar/consumers/`).
WebSocket URL routing in `config/urls/`.

## Async work

Celery via `config/celery.py`. Tasks live in `apps/<app>/tasks/`. Broker = Redis.

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
