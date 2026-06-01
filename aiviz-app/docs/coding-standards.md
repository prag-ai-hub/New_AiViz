# Coding standards — aiviz-app

## File-size budget (enforced by eslint `max-lines`)

| Type | Max lines |
|------|-----------|
| Screen | 80 |
| Component | 120 |
| Hook | 100 |
| Service | 150 |
| API file | 80 |
| Store | 120 |

Split aggressively. Five 80-line files beat one 400-line file.

## No god files

❌ `utils.ts`, `helpers.ts`, `services.ts`, `api.ts`
✅ `date-format.util.ts`, `quota-check.service.ts`, `chat.api.ts`, `stream-parser.service.ts`

One purpose per file. Filename matches the export.

## Where logic lives

| Logic | Where |
|-------|-------|
| Route registration | `app/**/*.tsx` (Expo Router) — composition only |
| UI composition | `features/<x>/screens/` |
| Reusable UI | `features/<x>/components/` or `shared/components/` |
| Orchestration | `features/<x>/hooks/` |
| Business logic | `features/<x>/services/` |
| Network | `features/<x>/api/` or `@/core/api` |
| Server state | TanStack Query (use via hook) |
| Local UI state | Zustand store in `features/<x>/state/` |
| Persistence | `@/core/storage` |
| Validation | Zod schema in `features/<x>/validations/` |

## Imports

- Path aliases only: `@/core/*`, `@/shared/*`, `@/features/*`, `@/integrations/*`, `@/workers/*`.
- Never `../../../`.
- Import from a feature's barrel (`features/vidya-lm`) only from **inside** that
  feature. From outside, import from the public surface the feature chooses to
  expose in its `index.ts`.

## Screens are thin

```tsx
export function ChatScreen() {
  return (
    <Screen>
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </Screen>
  );
}
```

NO business logic inside screens. NO `axios.post()` inside components. Always route
through `services/` and `api/`.

## Naming

| Kind | Naming |
|------|--------|
| Component / screen | `PascalCase.tsx` (`ChatBubble.tsx`) |
| Hook | `useThing.ts` |
| Service | `<thing>.service.ts` |
| API file | `<resource>.api.ts` |
| Store | `<thing>.store.ts` |
| Type module | `<thing>.types.ts` |
| Zod schema | `<thing>.schema.ts` |
| Util | `<thing>.util.ts` |

## State separation

- **Server** → TanStack Query. Never store fetched server data in Zustand.
- **Local UI** → Zustand. Toggles, drafts, modal visibility, etc.
- **Persisted** → MMKV via `@/core/storage`. Always namespaced (`aiviz.<area>.<key>`).
- **Secure tokens** → SecureStore via `@/core/storage`. Never MMKV.

## Don'ts

- ❌ `axios.post(...)` directly in a component or screen.
- ❌ Catching everything with `try { } catch (e) {}` and swallowing.
- ❌ Putting i18n string literals inline. Use `t("key")`.
- ❌ Putting raw color values inline. Use `useTheme().colors.*` or `tokens.*`.
- ❌ Side effects in module top-level. Put them in `useEffect` or `AppProviders`.

## Linting / formatting

```bash
npm run lint
npm run typecheck
npx prettier --write .
```
