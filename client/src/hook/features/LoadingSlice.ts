import { createSlice } from "@reduxjs/toolkit";

type LoadingState = {
  onLoading: boolean;
};

const initialState = {
  onLoading: false,
} as LoadingState;

export const loading = createSlice({
  name: "loading",
  initialState,
  reducers: {
    resetLoading: () => initialState,
    setLoading: (state) => {
      state.onLoading = true;
    },
  },
});

export const { resetLoading, setLoading } = loading.actions;
export default loading.reducer;
