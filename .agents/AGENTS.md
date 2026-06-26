# Project Agent Rules — React Native Expo Starter

## Stack
- **Expo SDK 56** · React 19 · React Native 0.85
- **Expo Router v4** (file-based, typed routes, `src/app/` root)
- **NativeWind v4** (Tailwind CSS for React Native, `className` prop)
- **Redux Toolkit** + **Redux Persist** + **SecureStore** adapter
- **RTK Query** via `redux/api/baseApi.ts`
- **RevenueCat** (`react-native-purchases`) for IAP
- **Sentry** (`@sentry/react-native`) — optional, toggle via `SENTRY_DSN` env var
- **expo-notifications** for push notifications

---

## Package Installation — CRITICAL

**ALWAYS use `npx expo install <package>` — NEVER `npm install` or `yarn add`.**

`npx expo install` resolves the correct version for the current SDK.
Use `npm install` only for pure JS/dev-only packages (e.g., `eslint` plugins).

```bash
# ✅ Correct
npx expo install expo-camera react-native-mmkv

# ❌ Wrong
npm install expo-camera
yarn add react-native-mmkv
```

After adding any native module, rebuild the dev client:
```bash
npx expo prebuild --clean
npx expo run:android   # or run:ios
```

---

## File Structure

```
reactnativestarter/
├── src/
│   ├── app/              # Expo Router screens (file-based routing)
│   │   ├── _layout.tsx   # Root layout — providers, fonts, splash
│   │   ├── (auth)/       # Unauthenticated screens (login, register)
│   │   └── (app)/        # Authenticated screens (tabs, protected routes)
│   ├── components/       # Reusable UI components
│   │   └── providers/    # React context providers
│   ├── constants/        # App-wide constants and theme tokens
│   └── hooks/            # React hooks
├── redux/                # Redux store, slices, RTK Query APIs
│   ├── api/baseApi.ts    # RTK Query base API
│   ├── features/         # Redux slices (auth, child, etc.)
│   ├── store.ts          # configureStore with persist
│   ├── hooks.ts          # useAppDispatch, useAppSelector
│   └── storage.ts        # SecureStore adapter for redux-persist
├── services/             # Non-Redux service wrappers (RevenueCat, etc.)
├── hooks/                # Root-level hooks (useRevenueCat, useNotifications, etc.)
├── lib/                  # SDK init helpers (sentry.ts, revenuecat.ts)
└── types/                # Shared TypeScript types
```

---

## Routing Conventions

- All routes live in `src/app/`
- `(auth)/` group = unauthenticated (no token required)
- `(app)/` group = authenticated (token required — redirect to login if missing)
- Use `useAppSelector(selectCurrentToken)` to check auth state in layouts
- Use `router.replace('/(auth)/login')` for auth redirects (not `push`)

---

## Redux / RTK Query

- Use `useAppDispatch` and `useAppSelector` (typed wrappers) — never raw `useDispatch`/`useSelector`
- Add feature APIs by injecting into `baseApi` with `baseApi.injectEndpoints()`
- Always define tag types in `baseApi.ts` `tagTypes` array before using them
- Selectors live at the bottom of each slice file, prefixed with `select`

```ts
// ✅ Correct
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
const user = useAppSelector(selectCurrentUser);

// ❌ Wrong
import { useSelector } from 'react-redux';
const user = useSelector((state: any) => state.auth.user);
```

---

## Styling — NativeWind v4

- Use `className` prop for all styling (NativeWind)
- Custom tokens are defined in `tailwind.config.js`
- For conditional classes use `clsx` / `cn` from `clsx`
- Platform-specific styles: use `.web.tsx` / `.native.tsx` file extensions

---

## Sentry (Optional)

Sentry is **opt-in**. It is a no-op when `EXPO_PUBLIC_SENTRY_DSN` is not set in `.env.local`.
- Init: `src/lib/sentry.ts` — call `initSentry()` once in `_layout.tsx`
- Never remove the Sentry init call — just leave `EXPO_PUBLIC_SENTRY_DSN` blank to disable

---

## Environment Variables

All env vars must use the `EXPO_PUBLIC_` prefix to be accessible in the JS bundle.
Private server-side vars (like `SENTRY_AUTH_TOKEN`) are build-time only and do NOT use that prefix.

Required vars — see `.env.example` for the full template.

---

## EAS Build Profiles

| Profile | Purpose | Command |
|---|---|---|
| `development` | Dev client build | `eas build -p android --profile development` |
| `preview` | APK for testers | `eas build -p android --profile preview` |
| `production` | Store submission | `eas build -p android --profile production` |

OTA updates: `eas update --branch production --message "..."` for JS-only changes.

---

## Docs

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
