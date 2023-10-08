import TranslateCode from "@/language/translate";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type PopupState = {
  type?: "success" | "fail";
  text: string;
};

const initialState = {
  type: undefined,
  text: "",
} as PopupState;

export const popup = createSlice({
  name: "popup",
  initialState,
  reducers: {
    resetPopUp: () => initialState,
    successPopUp: (state, action: PayloadAction<string>) => {
      state.text = TranslateCode("VI", action.payload);
      state.type = "success";
    },
    failPopUp: (state, action: PayloadAction<string>) => {
      state.text = TranslateCode("VI", action.payload);
      state.type = "fail";
    },
  },
});

export const { resetPopUp, successPopUp, failPopUp } = popup.actions;
export default popup.reducer;
