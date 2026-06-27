import { baseApi } from "./baseApi";

export interface VideoLesson {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  youtubeId: string;
  thumbnailUrl: string;
  durationSeconds: number;
  learningPath: string;
  level: number;
  nctbClass?: number;
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface VideoProgress {
  id: string;
  userId: string;
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
  xpEarned: number;
  updatedAt: string;
  video?: Pick<VideoLesson, "id" | "title" | "titleBn" | "thumbnailUrl" | "durationSeconds">;
}

export interface GetVideosParams {
  path?: string;
  level?: number;
  page?: number;
  limit?: number;
}

export interface TrackProgressPayload {
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
}

export const videoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<
      { videos: VideoLesson[]; pagination: { page: number; limit: number; total: number; totalPages: number } },
      GetVideosParams
    >({
      query: (params) => ({
        url: "/video",
        method: "GET",
        params,
      }),
      providesTags: ["Videos"],
    }),

    getVideoById: builder.query<VideoLesson, string>({
      query: (id) => `/video/${id}`,
      providesTags: (result, error, id) => [{ type: "Videos", id }],
    }),

    getMyVideoProgress: builder.query<VideoProgress[], void>({
      query: () => "/video/my-progress",
      providesTags: ["VideoProgress"],
    }),

    trackVideoProgress: builder.mutation<VideoProgress, TrackProgressPayload>({
      query: (body) => ({
        url: "/video/progress",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VideoProgress"],
    }),
  }),
});

export const {
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useGetMyVideoProgressQuery,
  useTrackVideoProgressMutation,
} = videoApi;
