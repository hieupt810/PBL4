import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./features/LoadingSlice";
import popupReducer from "./features/PopupSlice";
import searchReducer from "./features/SearchSlice";
import { useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    popupReducer,
    loadingReducer,
    search: searchReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
