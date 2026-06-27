// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type TUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'FREE' | 'PREMIUM' | 'ADMIN';
  learningPath: 'KIDS' | 'SPOKEN' | 'IELTS' | 'ADMISSION' | 'JOB' | 'VOCAB' | null;
  nctbClass: number | null;
  gems: number;
  xpTotal: number;
  lives: number;
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  createdAt: string;
};

export type TAuthState = {
  user: TUser | null;
  token: string | null;
  refreshToken?: string | null;
  device_token: string | null;
  hasSeenWelcome: boolean;
};

const initialState: TAuthState = {
  user: null,
  token: null,
  refreshToken: null,
  device_token: null,
  hasSeenWelcome: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Used by login / signup / otp verification
    setCredentials: (
      state,
      action: PayloadAction<{
        user: TUser;
        token: string;
        refreshToken?: string | null;
      }>,
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.hasSeenWelcome = true; // Once logged in, never show welcome screen again
    },

    // Used by token refresh (only updates token)
    updateToken: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>,
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    // Update user profile properties (e.g. after sync, or path change)
    updateUser: (state, action: PayloadAction<Partial<TUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Full logout — clears everything
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.device_token = null;
    },

    // Update device token
    updateDeviceToken: (
      state,
      action: PayloadAction<{ device_token: string }>,
    ) => {
      state.device_token = action.payload.device_token;
    },

    // Set welcome screen as seen
    setHasSeenWelcome: (state, action: PayloadAction<boolean>) => {
      state.hasSeenWelcome = action.payload;
    },
  },
});

export const { setCredentials, updateToken, updateUser, logout, updateDeviceToken, setHasSeenWelcome } = authSlice.actions;

export default authSlice.reducer;

// Selectors (use these everywhere)
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectCredentials = (state: RootState) => state.auth;
export const selectDeviceToken = (state: RootState) => state.auth.device_token;
export const selectUserName = (state: RootState) => state.auth.user?.name || "Learner";

