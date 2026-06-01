# Architecture — aiviz-app

## Shape

**Feature-first.** Every business concept (Vidya LM, Image Gen, Notebook, Billing,
Gamification, Parent, …) lives in `src/features/<feature>/` and owns its full stack:
screens, components, hooks, services, state, API, types, validations, adapters,
mappers, analytics, offline rules, tests.

Cross-cutting machinery (auth, offline, quota, tool registry, i18n, theme) lives in
`src/core/`. Reusable UI primitives in `src/shared/`. External SDK wrappers in
`src/integrations/`. Routes are 4-line shells under `app/` (Expo Router).

```
app/                    Expo Router — composition only, NO logic
src/
  core/                 app engine
  shared/               reusable UI + theme + animations
  features/<feature>/   the feature, end to end
  integrations/         openai, replicate, simli, razorpay, msg91, …
  workers/              sync, upload, queue
```

## Layers (hard line)

| Layer | Lives in | Allowed to call | Disallowed |
|-------|----------|-----------------|------------|
| Route shell | `app/**/*.tsx` | feature `screens/` exports | nothing else |
| Screen | `features/<x>/screens/` | feature components, hooks | direct API, direct store wiring beyond hooks |
| Component | `features/<x>/components/` or `shared/components/` | hooks, presentational props | API, services |
| Hook | `features/<x>/hooks/` | services, queries | direct axios |
| Service | `features/<x>/services/` | api, adapters, mappers | UI |
| API | `features/<x>/api/` or `core/api/` | axios (network) | business logic |
| Store | `features/<x>/state/` | services from inside actions | UI imports of components |

**The cardinal rule:** screens compose, hooks orchestrate, services hold logic, api is
network only.

## State split

| Concern | Tool |
|---------|------|
| Server state | TanStack Query |
| Local UI state | Zustand |
| Persisted / offline | MMKV (via `@/core/storage`) |
| Secure tokens | Expo SecureStore (via `@/core/storage`) |
| Forms | React Hook Form |
| Validation | Zod |

## Theming & i18n

- `@/core/theme` exposes `tokens` (colors light/dark, spacing, radii, font sizes).
- `@/core/providers` exposes `ThemeProvider` with `light/dark/system` modes,
  MMKV-persisted. Consume via `useTheme()`.
- `@/core/i18n` initialises i18next on app boot. Bundles for `en` / `hi` / `mr`
  are empty on Day 1 — Day 19 fills them.

## Path aliases

```ts
@/core/*          → src/core/*
@/shared/*        → src/shared/*
@/features/*      → src/features/*
@/integrations/*  → src/integrations/*
@/workers/*       → src/workers/*
```

Wired in `tsconfig.json` + `babel.config.js`. Never use `../../../`.

## File-size budget (enforced by eslint `max-lines`)

| Type | Max lines |
|------|-----------|
| Screen | 80 |
| Component | 120 |
| Hook | 100 |
| Service | 150 |
| API file | 80 |
| Store | 120 |

## Offline & realtime

- `@/core/storage/cache.storage.ts` for MMKV-backed reads with TTL.
- `@/core/offline/` (queue/retry/sync/conflict) — engine lives in core; per-feature
  offline rules under `features/<x>/offline/`.
- WebSocket consumers live alongside the relevant feature (`features/vidya-lm/`,
  `features/speech-tutor/`, `features/avatar/`).

## Workers

Background work runs in `src/workers/`. Day 1 has stubs for `sync`, `upload`, `queue`.
