import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface LocalBookmark {
  id: string;
  word: string;
  meaning: string;
  contextSentence: string;
  storyId: string;
  savedAt: string;
}

export interface ProgressState {
  completedStoryIds: string[];
  unlockedLevels: string[];
  bookmarks: LocalBookmark[];
  storyProgress: Record<string, { currentPageIndex: number; isCompleted: boolean }>;
}

const initialState: ProgressState = {
  completedStoryIds: [],
  unlockedLevels: ["1"], // Default to level 1 unlocked
  bookmarks: [],
  storyProgress: {},
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<LocalBookmark>) => {
      // Avoid duplicate bookmarks
      if (!state.bookmarks.find(b => b.word.toLowerCase() === action.payload.word.toLowerCase())) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmarkByWord: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter(
        b => b.word.toLowerCase() !== action.payload.toLowerCase()
      );
    },
    setBookmarksList: (state, action: PayloadAction<LocalBookmark[]>) => {
      state.bookmarks = action.payload;
    },
    markStoryAsCompleted: (state, action: PayloadAction<string>) => {
      if (!state.completedStoryIds.includes(action.payload)) {
        state.completedStoryIds.push(action.payload);
      }
      if (state.storyProgress[action.payload]) {
        state.storyProgress[action.payload].isCompleted = true;
      } else {
        state.storyProgress[action.payload] = { currentPageIndex: 0, isCompleted: true };
      }
    },
    updateStoryPageProgress: (state, action: PayloadAction<{ storyId: string; pageIndex: number; isCompleted?: boolean }>) => {
      const { storyId, pageIndex, isCompleted = false } = action.payload;
      state.storyProgress[storyId] = {
        currentPageIndex: pageIndex,
        isCompleted: isCompleted || (state.storyProgress[storyId]?.isCompleted || false),
      };
    },
    unlockLevel: (state, action: PayloadAction<string>) => {
      if (!state.unlockedLevels.includes(action.payload)) {
        state.unlockedLevels.push(action.payload);
      }
    },
  },
});

export const {
  addBookmark,
  removeBookmarkByWord,
  setBookmarksList,
  markStoryAsCompleted,
  updateStoryPageProgress,
  unlockLevel,
} = progressSlice.actions;

export default progressSlice.reducer;

export const selectLocalBookmarks = (state: RootState) => state.progress.bookmarks;
export const selectCompletedStories = (state: RootState) => state.progress.completedStoryIds;
export const selectUnlockedLevels = (state: RootState) => state.progress.unlockedLevels;
export const selectStoryProgress = (state: RootState) => state.progress.storyProgress;
export const selectSingleStoryProgress = (storyId: string) => (state: RootState) => state.progress.storyProgress[storyId];

