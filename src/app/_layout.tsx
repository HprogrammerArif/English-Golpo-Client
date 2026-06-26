import { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from "expo-router";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import type { NotificationResponse } from "expo-notifications";
import "@/global.css";

if (__DEV__) {
  require("../lib/ReactotronConfig");
}

import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import { initSentry } from "@/lib/sentry";
import { configureRevenueCat } from "@/lib/revenuecat";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

// Initialize Sentry once at module load (no-op if DSN not set)
initSentry();

// ─── Inner layout — has Redux store access ───────────────────────────────────
function InnerLayout() {
  const colorScheme = useColorScheme();
  const user = useAppSelector(selectCurrentUser);

  // Configure RevenueCat when user is known
  useEffect(() => {
    const userId = user?.id ? String(user.id) : null;
    configureRevenueCat(userId);
  }, [user?.id]);

  // Register for push notifications
  useNotifications({
    onTokenReady: (pushToken: string) => {
      // TODO: dispatch(updateDeviceToken({ device_token: pushToken }));
      if (__DEV__) console.log("[Layout] Push token:", pushToken);
    },
    onNotificationResponse: (_response: NotificationResponse) => {
      // TODO: navigate to relevant screen based on response.notification.request.content.data
    },
  });

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Slot />
      <OfflineBanner />
      <Toast />
    </ThemeProvider>
  );
}

// ─── Root Layout — all providers ────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ReduxProvider>
        <InnerLayout />
      </ReduxProvider>
    </ErrorBoundary>
  );
}
