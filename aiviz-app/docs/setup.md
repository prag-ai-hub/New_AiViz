# Setup — aiviz-app

## Prerequisites

- **Node.js 20+** (Expo SDK 54 + TypeScript 5.9 need Node 20; Ubuntu's default Node 12 is too old)
- npm 10+
- Expo Go on a device (Play Store / App Store — SDK 54 build), **or** Android Studio / Xcode for a dev build

## Local dev (one-time)

```bash
cd aiviz-app

# 1. deps — .npmrc already pins ignore-scripts=true (avoids a broken
#    react-native-screens prepare script) and legacy-peer-deps=true.
npm install

# 2. env
cp .env.example .env
# edit EXPO_PUBLIC_API_URL if your backend isn't on http://localhost:8000

# 3. start metro
npx expo start --clear
```

Then either:

- Scan the QR with Expo Go on a phone (must be a SDK 54 build; the Play Store install is current)
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator

You should see the SplashScreen placeholder: **"AIVIZ" + "Day 1 placeholder · auth/SplashScreen"**.

## Smoke checks

```bash
npm run typecheck   # tsc --noEmit, verifies path aliases + TS strict
npm run lint        # eslint, enforces file-size budget
```

## Path alias quick test

In any file under `app/` or `src/`:

```ts
import { apiClient } from "@/core/api";
import { Screen } from "@/shared/layouts";
import { tokens } from "@/core/theme";
```

If your IDE doesn't resolve these, restart the TS server. Aliases are wired in
both `tsconfig.json` (for the IDE) and `babel.config.js` (for Metro).

## Stack on Day 1

| Concern | What we use today | What we'll use later |
|---------|-------------------|----------------------|
| Server state | TanStack Query | same |
| Local UI state | Zustand | same |
| Persistence | **AsyncStorage** (Expo Go compatible) | **MMKV v4** once we have a dev build (Day 5+) — same `getItem`/`setItem` semantics, just faster |
| Secure tokens | Expo SecureStore | same |
| Forms / validation | React Hook Form + Zod | same |
| Styling | NativeWind v4 + Tailwind v3 | same |
| Animation | Reanimated 4 + `react-native-worklets` | same |
| Routing | Expo Router v6 | same |

### Why AsyncStorage and not MMKV?

MMKV v4 is built on Nitro Modules, which isn't bundled in Expo Go. Using it requires
a development build (`npx expo prebuild && npx expo run:android`). For Day 1 we
swapped to AsyncStorage so the foundation can be verified inside Expo Go.

When you switch to a development build later, the swap is one file:

```ts
// src/core/storage/mmkv.ts
import { createMMKV, type MMKV } from "react-native-mmkv";
export const storage: MMKV = createMMKV({ id: "aiviz.default" });
```

…and `settings.storage.ts` / `cache.storage.ts` go back to sync APIs:

```ts
storage.getString(k)   // instead of: await storage.getItem(k)
storage.set(k, v)      // instead of: await storage.setItem(k, v)
storage.remove(k)      // instead of: await storage.removeItem(k)
```

ThemeProvider drops the `useEffect` and uses the lazy `useState` initialiser again.

## Common issues

- **`SyntaxError: Unexpected token '?'`** from `tsc` or `npx expo start` → Node 12. Upgrade to Node 20+ via NodeSource: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`. If apt errors on conflicting `libnode-dev` / `libnode72`, `sudo apt remove -y libnode-dev libnode72` first.
- **`bob: not found` / `react-native-builder-bob` error during `npm install`** → broken prepare script in `react-native-screens`. `.npmrc` has `ignore-scripts=true` which sidesteps it; if you reinstall, keep that flag.
- **`Tailwind CSS has not been configured with the NativeWind preset`** → `tailwind.config.js` needs `presets: [require("nativewind/preset")]`. Already wired.
- **`The native "NitroModules" Turbo/Native-Module could not be found`** → MMKV v4 isn't in Expo Go. Either keep AsyncStorage or switch to a dev build.
- **`i18next::pluralResolver: Your environment seems not to be Intl API compatible`** → benign warning; we set `compatibilityJSON: "v3"` to silence it.
- **Metro can't resolve `@/...`** → bust the cache: `npx expo start --clear`.
- **Expo Go "Project is incompatible — SDK 54 vs 51"** → upgrade project to match Expo Go's SDK, **or** install an older Expo Go (`https://expo.dev/go?sdkVersion=51`). We chose to upgrade.
- **Android emulator can't hit `localhost:8000`** → use `http://10.0.2.2:8000`.
