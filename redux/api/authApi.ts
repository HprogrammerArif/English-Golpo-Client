import { baseApi } from "./baseApi";
import { TUser } from "../features/auth/authSlice";

export interface AuthResponse {
  user: TUser;
  token: string;
  refreshToken?: string;
}

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    loginPhone: builder.mutation<{ success: boolean; message: string }, { phone: string }>({
      query: (body) => ({
        url: "/auth/login/phone",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, { phone: string; code: string }>({
      query: (body) => ({
        url: "/auth/login/phone/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    registerPhone: builder.mutation<AuthResponse, {
      name: string;
      phone?: string;
      email?: string;
      password?: string;
      learningPath?: string;
    }>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    ssoLogin: builder.mutation<AuthResponse, { idToken: string; provider: "google" | "apple" }>({
      query: (body) => ({
        url: "/auth/login/sso",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query<TUser, void>({
      query: () => "/user/me",
      providesTags: ["User"],
    }),
    updateMe: builder.mutation<TUser, Partial<TUser>>({
      query: (body) => ({
        url: "/user/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginPhoneMutation,
  useVerifyOtpMutation,
  useRegisterPhoneMutation,
  useSsoLoginMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} = authApi;
