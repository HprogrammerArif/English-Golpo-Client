// src/features/child/childSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ChildState {
  children: any[]; // your child type
}

const initialState: ChildState = {
  children: [],
};

const childSlice = createSlice({
  name: 'child',
  initialState,
  reducers: {
    setChildren: (state, action) => {
      state.children = action.payload;
    },
    addChild: (state, action) => {
      state.children.push(action.payload);
    },
  },
});

export const { setChildren, addChild } = childSlice.actions;
export default childSlice.reducer;