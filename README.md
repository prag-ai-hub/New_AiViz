# AIVIZ 2.0 — Monorepo Workspace

Two sibling repos, deliberately separate so each can ship & deploy on its own cadence:

```
AiViz New/
├── aiviz-app/        # React Native (Expo SDK 51) — mobile client
└── aiviz-backend/    # Django 5 + DRF + Channels + Celery — API & realtime
```

Pick a side and the README inside that repo explains the local rules. The architecture
is **feature-first / domain-driven** on both sides — never grouped by `screens/` or
`components/`. Every feature owns its UI, API, hooks, services, state, types, validations.

## Golden rules (apply to both repos)

| Rule | Frontend | Backend |
|------|----------|---------|
| Build by **feature/domain**, not by file type | `src/features/<feature>/` | `apps/<app>/` |
| Keep files **short** (split aggressively) | screen ≤80, component ≤120, hook ≤100, service ≤150 lines | service ≤150, view ≤80, serializer ≤80 lines |
| **No god files** (`utils.ts`, `helpers.py`, `services.ts`, …) | `date-format.util.ts`, `quota-check.service.ts` | `quota_check.py`, `streak_award.service.py` |
| **Barrel exports** so imports stay short | every folder has `index.ts` | every package has `__init__.py` |
| **Path aliases** — never `../../../` | `@/core/*`, `@/shared/*`, `@/features/*`, `@/integrations/*` | `apps.*`, `core.*`, `infrastructure.*` |
| **Service layer separation** | screens compose, hooks orchestrate, services contain logic, api/ is network only | views are thin; logic in services; reads via selectors; writes via repositories |

## Layering — the hard line

**Frontend**
```
app/                → Expo Router only (4-line shells, no logic)
src/features/<x>/   → feature lives here, end to end
src/shared/         → reusable UI primitives + theme
src/core/           → app engine (auth, offline, quota, tool registry, i18n, …)
src/integrations/   → wrappers around external SDKs (openai, simli, razorpay, …)
src/workers/        → background workers (sync, upload, queue)
```

**Backend**
```
apps/<app>/         → domain module (models, services, selectors, repositories, api/)
core/               → cross-cutting engines (quota, offline, events, flags, tools registry, …)
infrastructure/     → external system adapters (openai, replicate, razorpay, redis, …)
config/             → settings split (base/dev/prod/test), urls, asgi/wsgi, celery
```

## Architectural patterns to follow

- **Selector pattern** — `apps/<app>/selectors/` for pure DB reads. Never write here.
- **Service pattern** — `apps/<app>/services/` for business logic. Returns plain data, raises domain exceptions.
- **Repository pattern** — `apps/<app>/repositories/` for complex multi-row writes & transactions.
- **Event-driven** — emit events (`MessageGenerated`, `XPAdded`, `BadgeUnlocked`, …) via Django signals from `core/events/`. Consumers in `apps/<app>/signals/`.
- **Tool registry** — `core/tools/` is the single source of truth for the list of AI tools. Never hardcode tool keys anywhere else.
- **Centralized quota engine** — `core/quota/` (NOT per-feature). Apply via `@quota_required(tool_key, cost)`.
- **Offline-first engine** — `core/offline/{sync,queue,retry,conflict}/` is shared between RN (mirror lives at `src/core/offline/`) and backend acknowledgements.

## State split (frontend only)

| Concern | Tool |
|---------|------|
| Server state | TanStack Query |
| Local UI state | Zustand |
| Persisted / offline | MMKV |
| Forms | React Hook Form |
| Validation | Zod |

## Daily workflow (per kickoff plan)

- 9:30 standup, end-of-day Loom ≤3 min + PR, same-day review.
- Friday 5 PM weekly demo.
- Tag `v2.0.0-beta` on Day 20.
# New_AiViz
