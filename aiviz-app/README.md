# aiviz-app

React Native (Expo SDK 51) client for AIVIZ 2.0.

## Layout

```
app/                        Expo Router routes — composition only, no logic
  _layout.tsx
  (public)/                 unauthenticated landing
  (auth)/                   login, signup, otp, onboarding/*
  (protected)/              auth-gated stack
  (tabs)/{home,tools,notebook,profile}
  tools/                    individual AI tool routes (vidya-lm/[sessionId], …)
  parent/                   role-switched parent UI
  settings/
  modal/                    presentation: modal

src/
  core/                     app engine
    api/                    axios instance + interceptors
    auth/                   token storage, refresh, session
    config/                 env, constants accessors
    constants/              app-wide constants
    errors/                 error classes & boundaries
    flags/                  feature flags
    guards/                 AuthGuard, ParentGuard, PaywallGuard
    hooks/                  cross-app hooks
    i18n/                   i18next setup, hi/mr/en bundles
    layouts/                Screen, Container layout primitives
    navigation/             nav helpers, deep links
    offline/                sync/, queue/, retry/, conflict/
    permissions/            mic, notifications, etc.
    providers/              QueryClient, Theme, i18n provider tree
    query/                  TanStack Query keys & factories
    quota/                  centralized quota engine
    storage/                MMKV + SecureStore wrappers
    theme/                  design tokens, dark mode
    tools/                  tool registry (source of truth)
    types/                  app-wide types (User, Tool, APIResponse, …)
    utils/                  small one-purpose utilities (NO god files)
    validations/            shared Zod schemas

  shared/                   reusable across features
    animations/
    assets/
    components/             buttons, cards, modals, sheets, loaders,
                            avatars, inputs, markdown, media, charts, typography
    icons/
    lib/                    framework-adjacent helpers
    services/               cross-feature services

  features/<feature>/       feature owns everything — UI, state, API, types
    api/                    network only
    components/             feature components
    constants/
    hooks/
    screens/                thin compositions
    services/               business logic
    state/                  Zustand stores
    types/
    utils/
    validations/
    adapters/               server ↔ ui shape conversion
    mappers/                domain mapping
    analytics/              event names + emitters
    offline/                feature-specific offline rules
    tests/
    index.ts
    routes.ts               route map for this feature

  integrations/             external SDK wrappers
    openai/  replicate/  elevenlabs/  razorpay/  simli/  msg91/  analytics/

  workers/                  background workers
    sync.worker.ts
    upload.worker.ts
    queue.worker.ts

tests/{unit,integration,e2e,mocks}
scripts/  docs/  .github/workflows/
```

## Path aliases

```ts
import { useChat } from "@/features/vidya-lm/hooks";
import { Button } from "@/shared/components/buttons";
import { apiClient } from "@/core/api";
```

Configured in `tsconfig.json` + `babel.config.js`.

## File-size budget (enforced by eslint `max-lines`)

| Type | Max lines |
|------|-----------|
| Screen | 80 |
| Component | 120 |
| Hook | 100 |
| Service | 150 |
| API file | 80 |
| Store | 120 |

## Layer rules

- **Screens** are composition only — render components, no business logic.
- **Components** are presentational, accept props, no direct API/store wiring beyond hooks.
- **Hooks** orchestrate. Read services, expose state.
- **Services** hold logic. Never call axios directly — go through `api/`.
- **API files** are pure network — request shape, fetch, return parsed data.
- **State** — server state via TanStack Query, local via Zustand, persisted via MMKV.

## Run

```bash
npm install
npm start
```
