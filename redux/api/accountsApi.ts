import { baseApi } from "./baseApi";

export interface ChildActivity {
  id: string;
  name: string;
  phone: string | null;
  xpTotal: number;
  lives: number;
  streak: number;
  weeklyXp: number;
  activityCalendar: string[]; // ISO date strings
}

export interface ParentDashboardResponse {
  children: ChildActivity[];
}

export interface B2BMember {
  id: string;
  name: string;
  phone: string | null;
  xpTotal: number;
  league: string;
}

export interface B2BDashboardResponse {
  id: string;
  name: string;
  type: string;
  licenseCount: number;
  activeLicenses: number;
  members: B2BMember[];
}

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParentDashboard: builder.query<ParentDashboardResponse, void>({
      query: () => "/accounts/parents/dashboard",
    }),
    linkChildAccount: builder.mutation<{ success: boolean; childId: string }, { childPhone: string }>({
      query: (body) => ({
        url: "/accounts/parents/link-child",
        method: "POST",
        body,
      }),
    }),
    provisionB2B: builder.mutation<B2BDashboardResponse, { name: string; type: "SCHOOL" | "COACHING_CENTER" | "MADRASA" | "FAMILY" | "CORPORATE"; licenseCount?: number }>({
      query: (body) => ({
        url: "/accounts/b2b/provision",
        method: "POST",
        body,
      }),
    }),
    getB2BDashboard: builder.query<B2BDashboardResponse, void>({
      query: () => "/accounts/b2b/dashboard",
    }),
  }),
});

export const {
  useGetParentDashboardQuery,
  useLinkChildAccountMutation,
  useProvisionB2BMutation,
  useGetB2BDashboardQuery,
} = accountsApi;
