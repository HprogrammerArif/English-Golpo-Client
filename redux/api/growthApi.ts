import { baseApi } from "./baseApi";

export interface ReferralLinkResponse {
  code: string;
  referralLink: string;
  shareMessage: string;
}

export interface ShareCardResponse {
  shareText: string;
  scoreCardUrl: string;
}

export const growthApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getReferralLink: builder.query<ReferralLinkResponse, void>({
      query: () => "/growth/referral/link",
    }),
    redeemReferral: builder.mutation<{ success: boolean; rewardDays: number; referrerName: string }, { code: string }>({
      query: (body) => ({
        url: "/growth/referral/redeem",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    generateShareCard: builder.mutation<ShareCardResponse, { storyId: string; score: number }>({
      query: (body) => ({
        url: "/growth/share-card",
        method: "POST",
        body,
      }),
    }),
    trackGrowthEvent: builder.mutation<{ success: boolean }, { eventName: string; metadata?: any }>({
      query: (body) => ({
        url: "/growth/events/track",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetReferralLinkQuery,
  useRedeemReferralMutation,
  useGenerateShareCardMutation,
  useTrackGrowthEventMutation,
} = growthApi;
