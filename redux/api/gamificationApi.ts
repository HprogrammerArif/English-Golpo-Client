import { baseApi } from "./baseApi";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activityCalendar: string[]; // ISO date strings of active days
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  xpEarned: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  league: string;
  weekStarting: string;
  leaderboard: LeaderboardUser[];
}

export const gamificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addXp: builder.mutation<{ success: boolean; xpTotal: number; levelUp: boolean; newLevel: number }, number>({
      query: (amount) => ({
        url: "/gamification/xp/add",
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: ["User", "Leaderboard"],
    }),
    getStreak: builder.query<StreakData, void>({
      query: () => "/gamification/streak",
      providesTags: ["User"],
    }),
    getLeaderboard: builder.query<LeaderboardResponse, void>({
      query: () => "/gamification/leaderboard",
      providesTags: ["Leaderboard"],
    }),
  }),
});

export const {
  useAddXpMutation,
  useGetStreakQuery,
  useGetLeaderboardQuery,
} = gamificationApi;
