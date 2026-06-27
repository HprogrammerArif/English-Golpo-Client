import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface GameState {
  dailyGoalXp: number;
  lastCompletedQuizDate: string | null;
}

const initialState: GameState = {
  dailyGoalXp: 50,
  lastCompletedQuizDate: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoalXp = action.payload;
    },
    recordQuizCompletion: (state, action: PayloadAction<string>) => {
      state.lastCompletedQuizDate = action.payload;
    },
  },
});

export const { setDailyGoal, recordQuizCompletion } = gameSlice.actions;
export default gameSlice.reducer;

export const selectDailyGoal = (state: RootState) => state.game.dailyGoalXp;
export const selectLastCompletedQuizDate = (state: RootState) => state.game.lastCompletedQuizDate;
