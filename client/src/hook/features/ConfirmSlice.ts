import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type ConfirmState = {
  text: string;
  onConfirm: () => void;
};

const initialState = {
  text: "",
  onConfirm: () => {},
} as ConfirmState;

export const popup = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    reset: () => initialState,
    show: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
  },
});

export const { reset, show } = popup.actions;
export default popup.reducer;
