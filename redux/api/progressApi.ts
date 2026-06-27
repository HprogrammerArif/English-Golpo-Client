import { baseApi } from "./baseApi";

export interface ProgressSyncItem {
  storyId: string;
  completed: boolean;
  score: number;
  xpEarned: number;
}

export interface Bookmark {
  id: string;
  englishWord: string;
  banglaMeaning: string;
  context: string;
  savedAt: string;
  nextReviewAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface Flashcard {
  id: string;
  englishWord: string;
  banglaMeaning: string;
  context: string;
}

export const progressApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    syncProgress: builder.mutation<{ synced: number }, ProgressSyncItem[]>({
      query: (items) => ({
        url: "/progress/sync",
        method: "POST",
        body: { items },
      }),
      invalidatesTags: ["User", "Story"],
    }),
    getBookmarks: builder.query<{ items: Bookmark[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 50 } = {}) => `/progress/bookmarks?page=${page}&limit=${limit}`,
      providesTags: ["Bookmarks"],
    }),
    addBookmark: builder.mutation<Bookmark, { englishWord: string; banglaMeaning: string; context: string; wordTokenId?: string }>({
      query: (body) => ({
        url: "/progress/bookmarks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    removeBookmark: builder.mutation<{ success: boolean }, string>({
      query: (word) => ({
        url: `/progress/bookmarks/${encodeURIComponent(word)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    getFlashcardQueue: builder.query<Flashcard[], void>({
      query: () => "/progress/flashcard-queue",
      providesTags: ["Bookmarks"],
    }),
    submitFlashcardResult: builder.mutation<{ success: boolean }, { word: string; quality: number }>({
      query: (body) => ({
        url: "/progress/flashcard-result",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    getMistakes: builder.query<UserMistake[], void>({
      query: () => "/progress/mistakes",
      providesTags: ["Mistakes"],
    }),
    addMistake: builder.mutation<UserMistake, { type: "WORD" | "SENTENCE"; englishText: string; banglaText: string }>({
      query: (body) => ({
        url: "/progress/mistakes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Mistakes"],
    }),
    resolveMistake: builder.mutation<UserMistake, { id: string }>({
      query: (body) => ({
        url: "/progress/mistakes/resolve",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Mistakes"],
    }),
    getSentencePatterns: builder.query<SentencePattern[], void>({
      query: () => "/progress/sentence-patterns",
    }),
    getLearnedWords: builder.query<Bookmark[], void>({
      query: () => "/progress/learned",
      providesTags: ["Bookmarks"],
    }),
    toggleLearnedWord: builder.mutation<Bookmark, { word: string }>({
      query: (body) => ({
        url: "/progress/learned/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookmarks"],
    }),
  }),
});

export interface UserMistake {
  id: string;
  type: "WORD" | "SENTENCE";
  englishText: string;
  banglaText: string;
  incorrectCount: number;
  corrected: boolean;
  createdAt: string;
}

export interface SentencePattern {
  id: string;
  pattern: string;
  patternBn: string;
  exampleEn: string;
  exampleBn: string;
  category: string;
}

export const {
  useSyncProgressMutation,
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useGetFlashcardQueueQuery,
  useSubmitFlashcardResultMutation,
  useGetMistakesQuery,
  useAddMistakeMutation,
  useResolveMistakeMutation,
  useGetSentencePatternsQuery,
  useGetLearnedWordsQuery,
  useToggleLearnedWordMutation,
} = progressApi;
