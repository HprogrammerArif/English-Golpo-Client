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
  bookmarks: LocalBookmark[];
}

const initialState: ProgressState = {
  completedStoryIds: [],
  bookmarks: [],
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
    },
  },
});

export const { addBookmark, removeBookmarkByWord, setBookmarksList, markStoryAsCompleted } = progressSlice.actions;
export default progressSlice.reducer;

export const selectLocalBookmarks = (state: RootState) => state.progress.bookmarks;
export const selectCompletedStories = (state: RootState) => state.progress.completedStoryIds;
