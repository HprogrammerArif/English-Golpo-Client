# 🚀 React Native & Expo Best Practices (2025 Edition)

This guide covers advanced tips, tricks, and architectural patterns for building production-grade mobile apps.

---

## 🏗️ 1. Architecture & Folder Structure

### Feature-Based Architecture (Recommended)

Instead of grouping files by type (e.g., `components`, `screens`, `redux`), group them by **feature**. This makes your codebase scalable.

```
/src
  /features
    /auth
      - components/    (Auth-specific components)
      - screens/       (Login/Signup screens)
      - authSlice.ts   (Redux state)
      - authApi.ts     (RTK Query endpoints)
      - hooks/         (Auth hooks)
    /dashboard
    /settings
  /components/         (Global reusable UI components like Buttons, Inputs)
  /hooks/              (Global hooks)
  /utils/              (Helpers like date formatting)
```

### Absolute Imports

Configure `tsconfig.json` to avoid `../../../../` hell.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

_Usage:_ `import Button from '@/components/Button';`

---

## ⚡ 2. Performance Optimization

### 🖼️ Images

- **Use `expo-image`**: It is significantly faster than React Native's built-in `Image` component. It handles caching, blurhash, and performance out of the box.
  ```tsx
  import { Image } from "expo-image";
  <Image source="https://..." cachePolicy="memory-disk" />;
  ```
- **SVGs**: Use `react-native-svg` with `react-native-svg-transformer` to import SVGs directly as components.

### 📜 Lists (`FlashList`)

Replace `FlatList` with Shopify's **`FlashList`**. It runs on the UI thread and recycles views much more efficiently.

- _Tip:_ Always estimate `estimatedItemSize` correctly to avoid layout jumps.

### 🔄 Re-renders

- **`React.memo`**: Wrap pure UI components (like list items) in `React.memo` to prevent unnecessary re-renders when parent state changes.
- **`useCallback` & `useMemo`**: Essential for passing functions or objects to children properties, especially in lists.

### 🏃 Animations

- **Use `react-native-reanimated`**: Run animations on the UI thread (60fps) instead of the JS thread.
- Avoid `Animated` from `react-native` for complex animations.

---

## 🛠️ 3. State Management (Redux Toolkit)

### ✅ Do's

- **Use RTK Query**: You are already doing this! It handles caching, loading states, and de-duping requests automatically.
- **Normalize State**: If storing lists in Redux (not via API), store them as objects `{ ids: [], entities: {} }` for O(1) lookups.
- **Secure Persist**: As we set up, always use `expo-secure-store` for tokens.

### ❌ Don'ts

- Don't put typically "local" state (like form inputs or modal visibility) in Redux. Keep it in `useState`.
- Don't over-persist. Only persist critical user session data. Persisting too much bloats startup time.

---

## 🎨 4. Styling & UI

### 💅 NativeWind (Tailwind CSS)

Since you have it installed, use it! It simplifies styling significantly.

- _Trick:_ Use `clsx` or `cn` helper to conditionally merge classes.

### 📱 Safe Areas

Always wrap your main screen content in `SafeAreaView` (from `react-native-safe-area-context`, NOT react-native).

```tsx
import { SafeAreaView } from "react-native-safe-area-context";
// Use edges prop to control which sides to protect
<SafeAreaView edges={["top", "left", "right"]}>...</SafeAreaView>;
```

### ⌨️ Keyboard Handling

- Use `KeyboardAvoidingView` creates issues on Android + Expo Router often.
- **Better**: Use `react-native-keyboard-controller` (you have this!). It gives you fully synchronous keyboard animations.

---

## 🐛 5. Debugging & DevTools

### 🕵️ Reactotron (Must Have)

Install `reactotron-react-native`. It lets you:

- Inspect Redux state and actions in real-time.
- View network requests (API calls).
- Log directly from your device.

### ⚠️ Error Boundaries

Wrap your app in an Error Boundary to catch crashes and show a "Something went wrong" screen instead of a white screen or crash.

---

## 🔒 6. Security & Production

### 🔐 Storage

- **Sensitive**: (Tokens, Passwords) -> `expo-secure-store`
- **Non-sensitive**: (Theme preference, last opened tab) -> `AsyncStorage` / `MMKV`

### 🌍 Environment Variables

- Use `.env` files.
- **NEVER** commit .env files to Git.
- In Expo, use `process.env.EXPO_PUBLIC_...` for public variables available in JS code.

---

## 🚀 7. Bonus Tricks

### 🧩 Expo Config Plugins

If you need to modifying `AndroidManifest.xml` or `Info.plist`, don't edit the `android/ios` folders directly if you can avoid it. Write a **Config Plugin**. This keeps your native changes persistent even if you delete the android/ios folders (which you often do in Expo).

### 🏎️ Turbo Modules

If you write custom native code, use the new **New Architecture (Fabric/TurboModules)**. It's enabled by default in new Expo SDKs.
