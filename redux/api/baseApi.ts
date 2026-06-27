// src/api/baseApi.ts
import { createApi, fetchBaseQuery, retry, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout, updateToken } from "../features/auth/authSlice";
import Toast from "react-native-toast-message"; // or your toast library
import { RootState } from "../store";
import { Platform } from "react-native";

export const API_IMAGE_URL = "https://api.floruit.co.uk"
// export const API_IMAGE_URL = "http://10.10.13.61:8002"

// In production, EXPO_PUBLIC_API_URL must always be set.
// The ngrok fallback is only for local dev — it will be dead in production.
const API_URL = (() => {
  let url = process.env.EXPO_PUBLIC_API_URL || "https://intensely-optimal-unicorn.ngrok-free.app";
  url = url.replace(/"/g, "").replace(/\/$/, "");

  if (Platform.OS === "android") {
    if (url.includes("localhost")) {
      url = url.replace("localhost", "10.0.2.2");
    } else if (url.includes("127.0.0.1")) {
      url = url.replace("127.0.0.1", "10.0.2.2");
    }
  }

  if (!process.env.EXPO_PUBLIC_API_URL && !__DEV__) {
    throw new Error("[baseApi] EXPO_PUBLIC_API_URL is not set. Production builds require this env variable.");
  }
  return url;
})();
export const baseUrl = API_URL;
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  timeout: 15000, // 15 seconds timeout
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Skip token for public endpoints
    const skipAuth = [
      "login",
      "register",
      "refreshToken",
      "loginPhone",
      "verifyOtp",
      "registerPhone"
    ].includes(endpoint);
    if (skipAuth) return headers;

    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (
  args,
  api,
  extraOptions,
) => {
  const requestUrl = typeof args === "string" ? args : args.url;
  const loggedUrl = requestUrl.startsWith("/") ? requestUrl.slice(1) : requestUrl;
  if (__DEV__) console.log(`[RTK Query] 📡 Requesting: ${API_URL}/api/${loggedUrl}`);

  let result = await baseQuery(args, api, extraOptions);

  // Globally unwrap NestJS enveloped responses ({ success: true, data: ... })
  if (result.data && typeof result.data === "object" && "success" in result.data && "data" in result.data) {
    result.data = (result.data as any).data;
  }

  // Check if this is an approve/reject endpoint
  const isApproveRejectEndpoint = requestUrl?.includes('/expenses/approve/');
  const is403Error = result.error?.status === 403;

  if (__DEV__) {
    if (result.error) {
      if (!(isApproveRejectEndpoint && is403Error)) {
        console.log(`[RTK Query] ❌ Error for ${requestUrl}:`, result.error);
      }
    } else {
      console.log(`[RTK Query] ✅ Success for ${requestUrl}:`, result.data);
    }
  }

  // Handle known errors
  if (result.error?.status === 401) {
    if (__DEV__) console.log("Token expired — attempting refresh");

    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      if (__DEV__) console.log("No refresh token available - logging out");
      api.dispatch(logout());
      return result;
    }

    try {
      const refreshResult = await fetch(
        `${API_URL}/api/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        },
      );

      const data = await refreshResult.json();

      if (refreshResult.ok || data?.access) {
        const user = (api.getState() as RootState).auth.user;

        if (!user) {
          api.dispatch(logout());
          return result;
        }

        // Update token in store
        api.dispatch(
          updateToken({
            token: data.access,
          }),
        );

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
        
        // Globally unwrap NestJS enveloped responses for retried request
        if (result.data && typeof result.data === "object" && "success" in result.data && "data" in result.data) {
          result.data = (result.data as any).data;
        }
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      if (__DEV__) console.log("Refresh failed — logging out");
      api.dispatch(logout());
      Toast.show({
        type: "error",
        text1: "Session expired. Please log in again.",
      });
    }
  }

  // Optional: global error handling
  if (result.error) {
    const message =
      (result.error.data as any)?.message || "Something went wrong";
    
    // Don't show toast for expected 403 errors on approve/reject (handled in UI)
    if (result.error.status === 403 && !isApproveRejectEndpoint) {
      Toast.show({ type: "error", text1: message });
    } else if (result.error.status === 404) {
      if (__DEV__) console.log("404 error", message);
    } else if (
      typeof result.error.status === "number" &&
      result.error.status >= 500
    ) {
      Toast.show({
        type: "error",
        text1: "Server error. Please try again later.",
      });
    }
  }

  return result;
};

/**
 * Wraps baseQueryWithReauth with automatic retry logic.
 * Only retries on FETCH_ERROR (network failure) — never on 4xx / 5xx.
 * Max 2 retries (3 total attempts) with RTK Query's built-in exponential back-off.
 */
const baseQueryWithRetry = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await baseQueryWithReauth(args, api, extraOptions);
    // Bail immediately on definitive server/auth errors — no point retrying
    if (result.error && result.error.status !== "FETCH_ERROR") {
      retry.fail(result.error);
    }
    return result;
  },
  { maxRetries: 2 }
);

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRetry,
  refetchOnReconnect: true, // Re-fetch when network comes back
  refetchOnFocus: true,     // Re-fetch when app returns to foreground (AppState → onFocus)
  tagTypes: [
    "User",
    "Story",
    "Quiz",
    "Leaderboard",
    "Bookmarks",
    "Subscription",
    "documents",
    "Milestones",
    "PendingInvitations",
    "Schedule",
    "SubscriptionPlans",
    "MySubscription",
    "Children",
    "Profile",
    "Expense",
    "HomeScreenSentimentGraph",
    "NotificationPreferences",
    "NotificationHistory"
  ] as const,
  endpoints: (builder) => ({}),
});
