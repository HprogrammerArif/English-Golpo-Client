import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface GameState {
  streak: number;
  lastActiveDate: string | null; // ISO Date String
  xpPoints: number;
  level: number;
  lives: number; // Max 5, regenerates over time
  gems: number; // Earned by completing lessons, used in shop
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  dailyGoalXp: number; // e.g. 50 XP
  dailyXpEarned: number;
  achievements: { id: string; unlockedAt: string }[];
  lastCompletedQuizDate: string | null;
}

const initialState: GameState = {
  streak: 0,
  lastActiveDate: null,
  xpPoints: 0,
  level: 1,
  lives: 5,
  gems: 0,
  league: 'BRONZE',
  dailyGoalXp: 50,
  dailyXpEarned: 0,
  achievements: [],
  lastCompletedQuizDate: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoalXp = action.payload;
    },
    recordQuizCompletion: (state, action: PayloadAction<{ date: string; xp: number }>) => {
      state.lastCompletedQuizDate = action.payload.date;
      state.dailyXpEarned += action.payload.xp;
      state.xpPoints += action.payload.xp;
      
      // Level up calculation (simple formula: 100 XP per level)
      const newLevel = Math.floor(state.xpPoints / 100) + 1;
      if (newLevel > state.level) {
        state.level = newLevel;
      }
    },
    syncGameStats: (state, action: PayloadAction<Partial<GameState>>) => {
      return { ...state, ...action.payload };
    },
    consumeLife: (state) => {
      if (state.lives > 0) {
        state.lives -= 1;
      }
    },
    refillLives: (state, action: PayloadAction<number>) => {
      state.lives = Math.min(5, state.lives + action.payload);
    },
    addGems: (state, action: PayloadAction<number>) => {
      state.gems += action.payload;
    },
    spendGems: (state, action: PayloadAction<number>) => {
      if (state.gems >= action.payload) {
        state.gems -= action.payload;
      }
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.find(a => a.id === action.payload)) {
        state.achievements.push({
          id: action.payload,
          unlockedAt: new Date().toISOString()
        });
      }
    }
  },
});

export const {
  setDailyGoal,
  recordQuizCompletion,
  syncGameStats,
  consumeLife,
  refillLives,
  addGems,
  spendGems,
  unlockAchievement
} = gameSlice.actions;

export default gameSlice.reducer;

export const selectDailyGoal = (state: RootState) => state.game.dailyGoalXp;
export const selectLastCompletedQuizDate = (state: RootState) => state.game.lastCompletedQuizDate;
export const selectGameStats = (state: RootState) => state.game;
export const selectStreak = (state: RootState) => state.game.streak;
export const selectGems = (state: RootState) => state.game.gems;
export const selectLives = (state: RootState) => state.game.lives;
export const selectLevel = (state: RootState) => state.game.level;
export const selectXpPoints = (state: RootState) => state.game.xpPoints;
export const selectLeague = (state: RootState) => state.game.league;
export const selectDailyXpEarned = (state: RootState) => state.game.dailyXpEarned;

