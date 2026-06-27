import { baseApi } from "./baseApi";

export interface CreateBkashPaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBkashPayment: builder.mutation<CreateBkashPaymentResponse, { planId: string; storyId?: string }>({
      query: (body) => ({
        url: "/payment/bkash/create",
        method: "POST",
        body,
      }),
    }),
    unlockStory: builder.mutation<{ success: boolean; storyId: string }, { storyId: string; transactionId: string }>({
      query: (body) => ({
        url: "/payment/unlock-story",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Story", "User"],
    }),
    activateBooster: builder.mutation<{ success: boolean; expiryDate: string }, { transactionId: string }>({
      query: (body) => ({
        url: "/payment/booster",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useCreateBkashPaymentMutation,
  useUnlockStoryMutation,
  useActivateBoosterMutation,
} = paymentApi;
