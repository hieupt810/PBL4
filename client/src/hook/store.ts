import { configureStore } from "@reduxjs/toolkit";
import popupReducer from "./features/PopupSlice";

export const store = configureStore({
  reducer: {
    popupReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
