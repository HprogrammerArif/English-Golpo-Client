import { baseApi } from "./baseApi";

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionTextBn: string | null;
  options: string[];
  xpReward: number;
}

export interface Quiz {
  id: string;
  storyId: string;
  questions: QuizQuestion[];
}

export interface SubmitQuizResponse {
  score: number;        // percentage e.g. 100
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  correctAnswers: number[]; // correct index for each question
}

export const quizApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getQuizByStoryId: builder.query<Quiz, string>({
      query: (storyId) => `/quiz/${storyId}`,
      providesTags: (result, error, storyId) => [{ type: "Quiz", id: storyId }],
    }),
    submitQuizAnswers: builder.mutation<SubmitQuizResponse, { storyId: string; answers: number[] }>({
      query: ({ storyId, answers }) => ({
        url: `/quiz/${storyId}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: (result, error, { storyId }) => [
        { type: "Quiz", id: storyId },
        "User",
        "Story",
      ],
    }),
  }),
});

export const {
  useGetQuizByStoryIdQuery,
  useSubmitQuizAnswersMutation,
} = quizApi;
