import { baseApi } from "./baseApi";

export interface WordToken {
  id: string;
  english: string;
  bangla: string;
  sentenceContext: string;
  pronunciationG: string | null;
}

export interface Sentence {
  id: string;
  sentenceIdx: number;
  englishText: string;
  banglaText: string;
  startTime: number;
  endTime: number;
  tokens: WordToken[];
}

export interface StoryPage {
  id: string;
  pageIndex: number;
  imageUrl: string;
  sentences: Sentence[];
}

export interface Story {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  level: number;
  learningPath: string;
  isPremium: boolean;
  nctbClass: number | null;
  nctbUnit: string | null;
  illustrationUrl: string;
  audioUrl: string;
  durationSeconds: number;
  wordCount: number;
  tags: string[];
  pages: StoryPage[];
}

export const storyApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLearningPaths: builder.query<string[], void>({
      query: () => "/stories/paths",
    }),
    getStories: builder.query<Story[], { path?: string; level?: number }>({
      query: (params) => ({
        url: "/stories",
        params,
      }),
      providesTags: ["Story"],
    }),
    getStoryById: builder.query<Story, string>({
      query: (id) => `/stories/${id}`,
      providesTags: (result, error, id) => [{ type: "Story", id }],
    }),
  }),
});

export const {
  useGetLearningPathsQuery,
  useGetStoriesQuery,
  useGetStoryByIdQuery,
} = storyApi;
