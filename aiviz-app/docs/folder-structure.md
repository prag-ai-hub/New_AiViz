# Folder structure — aiviz-app

One-screen map. For deeper context see [architecture.md](architecture.md).

```
aiviz-app/
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── tailwind.config.js
├── package.json
├── global.css                    # NativeWind base
├── .env / .env.example
├── .eslintrc.cjs / .prettierrc / .gitignore
├── .github/workflows/ci.yml
│
├── app/                          # Expo Router — composition only
│   ├── _layout.tsx               # root: AppProviders + Stack
│   ├── (public)/                 # unauth landing
│   ├── (auth)/                   # login, signup, otp, onboarding/*
│   ├── (protected)/              # auth-gated stack
│   ├── (tabs)/                   # home, tools, notebook, profile
│   ├── tools/                    # AI tool routes (vidya-lm/[sessionId] etc.)
│   ├── parent/                   # parent role UI
│   ├── settings/
│   └── modal/                    # presentation: modal (paywall etc.)
│
├── src/
│   ├── core/                     # app engine
│   │   ├── api/                  # axios client + interceptors + errors
│   │   ├── auth/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── flags/
│   │   ├── guards/               # AuthGuard, ParentGuard
│   │   ├── hooks/
│   │   ├── i18n/                 # i18next + en/hi/mr bundles
│   │   ├── layouts/
│   │   ├── navigation/
│   │   ├── offline/{sync,queue,retry,conflict}/
│   │   ├── permissions/
│   │   ├── providers/            # QueryProvider, ThemeProvider, AppProviders
│   │   ├── query/                # TanStack Query key factories
│   │   ├── quota/                # client-side quota counters
│   │   ├── storage/              # mmkv + token + settings + cache
│   │   ├── theme/                # tokens
│   │   ├── tools/registry/       # tool registry
│   │   ├── types/
│   │   ├── utils/
│   │   └── validations/
│   │
│   ├── shared/                   # reusable
│   │   ├── animations/
│   │   ├── assets/
│   │   ├── components/{buttons,cards,modals,sheets,loaders,avatars,inputs,markdown,media,charts,typography}/
│   │   ├── icons/
│   │   ├── layouts/              # Screen wrapper
│   │   ├── lib/
│   │   └── services/
│   │
│   ├── features/<feature>/       # owns full stack per feature
│   │   ├── adapters/             # server ↔ ui shape
│   │   ├── analytics/            # event names + emitters
│   │   ├── api/                  # network
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── mappers/              # domain mapping
│   │   ├── offline/              # feature-specific offline rules
│   │   ├── screens/              # thin route compositions
│   │   ├── services/             # business logic
│   │   ├── state/                # Zustand stores
│   │   ├── tests/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── index.ts
│   │   └── routes.ts             # route map for the feature
│   │
│   ├── integrations/             # external SDK wrappers
│   │   ├── openai/
│   │   ├── replicate/
│   │   ├── elevenlabs/
│   │   ├── razorpay/
│   │   ├── simli/
│   │   ├── msg91/
│   │   └── analytics/
│   │
│   └── workers/
│       ├── sync.worker.ts
│       ├── upload.worker.ts
│       └── queue.worker.ts
│
├── tests/
│   ├── unit/  integration/  e2e/  mocks/
├── scripts/
└── docs/
```

## The 18 features

Cross-cutting (not AI tools):
`auth · onboarding · profile · home · notebook · gamification · billing · parent · notifications · settings`

AI tools (one per backend Django app):
`vidya-lm · image-gen · video-gen · music-gen · speech-tutor · avatar · code-helper · skillguru`

Each follows the standard sub-structure above.
