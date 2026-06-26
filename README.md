# 🚀 React Native Expo Starter

A production-grade **Expo SDK 56** starter template following all modern best practices. Clone this for every new project — everything is pre-configured and ready to build on.

---

## ✨ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) + React 19 + React Native 0.85 |
| Navigation | [Expo Router v4](https://docs.expo.dev/router/introduction/) (file-based, typed routes) |
| Styling | [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native) |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Persist](https://github.com/rt2zz/redux-persist) |
| Storage | `expo-secure-store` (encrypted persist adapter) |
| Data Fetching | [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) (in `baseApi`) |
| Payments | [RevenueCat](https://www.revenuecat.com/) (`react-native-purchases`) |
| Notifications | `expo-notifications` |
| Error Tracking | [Sentry](https://sentry.io/) (opt-in via env var) |
| Build & Deploy | [EAS Build + EAS Update](https://expo.dev/eas) |

---

## 📂 Project Structure

```
├── .agents/                  # AI agent rules and skills
│   ├── AGENTS.md             # Project-scoped rules for AI assistants
│   └── skills/
│       ├── expo-install/     # How to install packages correctly
│       ├── rtk-query/        # RTK Query patterns for this project
│       └── expo-router-auth/ # Auth flow pattern
│
├── src/
│   ├── app/                  # Expo Router screens (file-based routing)
│   │   ├── _layout.tsx       # Root layout — all providers wired here
│   │   ├── (auth)/           # Unauthenticated route group
│   │   │   ├── login.tsx     # Login screen scaffold
│   │   │   └── register.tsx  # Register screen scaffold
│   │   └── (app)/            # Authenticated route group (auth guard)
│   │       └── index.tsx     # Main home screen
│   ├── components/
│   │   ├── providers/
│   │   │   └── ReduxProvider.tsx   # Redux + PersistGate
│   │   └── ErrorBoundary.tsx       # React error boundary
│   ├── constants/
│   │   ├── index.ts          # Barrel export + app constants
│   │   └── theme.ts          # Colors, fonts, spacing tokens
│   └── hooks/
│       ├── use-color-scheme.ts
│       └── use-theme.ts
│
├── redux/                    # Redux store
│   ├── api/baseApi.ts        # RTK Query base API (inject endpoints here)
│   ├── features/
│   │   ├── auth/             # Auth slice + selectors
│   │   ├── child/            # Child slice
│   │   └── notificationService/
│   ├── store.ts              # configureStore + redux-persist
│   ├── hooks.ts              # useAppDispatch, useAppSelector (typed)
│   └── storage.ts            # SecureStore adapter for persist
│
├── hooks/                    # Root-level hooks
│   ├── useRevenueCat.ts      # IAP hook (offerings, purchase, restore)
│   ├── useNotifications.ts   # Push notification registration + listeners
│   ├── useNetworkStatus.ts   # NetInfo connectivity hook
│   └── useAppState.ts        # Foreground/background state hook
│
├── services/
│   └── revenueCat.ts         # RevenueCat service (getOfferings, purchasePackage, restorePurchases)
│
├── lib/
│   ├── sentry.ts             # Sentry init (opt-in, no-op if DSN not set)
│   └── revenuecat.ts         # RevenueCat configure + login/logout helpers
│
├── types/                    # Shared TypeScript types
├── assets/                   # Images, fonts, icons
│
├── .env.example              # Copy to .env.local and fill in values
├── eas.json                  # EAS build profiles (dev, preview, production)
└── tailwind.config.js        # NativeWind / Tailwind config
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> my-new-app
cd my-new-app

# 2. Install dependencies
npx expo install

# 3. Set up environment
cp .env.example .env.local
# Fill in your values in .env.local

# 4. Start the dev server
npm start
```

> **Note:** If you add native modules, you need a dev build — not Expo Go:
> ```bash
> npx expo run:android   # or run:ios
> ```

---

## 🔐 Environment Variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Your backend base URL |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | For IAP | RevenueCat Android API key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | For IAP | RevenueCat iOS API key |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional | Leave blank to disable Sentry |
| `EXPO_PUBLIC_PROJECT_ID` | For push | Your Expo project ID |
| `SENTRY_AUTH_TOKEN` | Build only | For Sentry source maps upload |

---

## 🛠 Scripts

| Script | Command | Description |
|---|---|---|
| Start dev server | `npm start` | Launch Metro bundler |
| Run on Android | `npm run android` | |
| Run on iOS | `npm run ios` | |
| Health check | `npm run doctor` | Check for Expo issues |
| Fix versions | `npm run fix` | Auto-fix version mismatches |
| Clear cache | `npm run clean` | Restart Metro with cleared cache |
| Rebuild native | `npm run rebuild` | `expo prebuild --clean` |
| Preview build | `npm run build:android` | EAS preview APK |
| Production build | `npm run build:android:prod` | EAS production bundle |
| OTA update | `npm run update` | Push JS update to production |

---

## 🔑 Auth Flow

1. User opens app → `(app)/_layout.tsx` checks Redux for token
2. No token → redirected to `/(auth)/login`
3. Successful login → `dispatch(setCredentials(...))` → `router.replace("/(app)")`
4. Logout → `dispatch(logout())` → `router.replace("/(auth)/login")`

Add new protected screens inside `src/app/(app)/` — they are automatically guarded.

---

## 📡 Adding a New API Endpoint

```ts
// redux/features/posts/posts.api.ts
import { baseApi } from "@/redux/api/baseApi";

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "/api/posts/",
      providesTags: ["Posts"],
    }),
  }),
});

export const { useGetPostsQuery } = postsApi;
```

Then add `"Posts"` to `tagTypes` in `redux/api/baseApi.ts`.

---

## 🏗 EAS Builds

```bash
# Development client (for native testing)
eas build -p android --profile development

# Preview APK (for testers)
npm run build:android

# Production (store submission)
npm run build:android:prod

# OTA update (JS changes only)
npm run update
```

---

## 🔇 Sentry (Optional)

Sentry is **disabled by default**. To enable:
1. Create a project at [sentry.io](https://sentry.io)
2. Add your DSN to `.env.local`:
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://xxx@ooo.ingest.sentry.io/yyy
   ```
3. That's it — no code changes needed.

---

## 📦 Installing New Packages

```bash
# ✅ Always use this
npx expo install <package-name>

# ❌ Never use these for RN packages
npm install <package-name>
```
