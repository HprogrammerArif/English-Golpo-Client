import { baseApi } from "./baseApi";

export interface Contribution {
  id: string;
  contributorId: string;
  contentType: string; // 'VIDEO' | 'AUDIO' | 'ILLUSTRATION'
  title: string;
  description: string | null;
  fileUrl: string;
  targetChildId: string | null;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
  payoutAmount: number;
  payoutStatus: string; // 'UNPAID' | 'PAID' | 'NOT_APPLICABLE'
  createdAt: string;
}

export interface SubmitContributionPayload {
  contentType: string;
  title: string;
  description?: string;
  fileUrl: string;
  targetChildId?: string;
}

export const contributionApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    submitContribution: builder.mutation<Contribution, SubmitContributionPayload>({
      query: (body) => ({
        url: "/contributions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contributions" as any],
    }),
    getMyContributions: builder.query<Contribution[], void>({
      query: () => "/contributions/my",
      providesTags: ["Contributions" as any],
    }),
  }),
});

export const {
  useSubmitContributionMutation,
  useGetMyContributionsQuery,
} = contributionApi;
