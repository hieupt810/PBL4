import { createSlice } from "@reduxjs/toolkit";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";

type TokenState = {
  token: string | undefined;
};

const initialState = {} as TokenState;

export const token = createSlice({
  name: "token",
  initialState,
  reducers: {
    removeToken: (state) => {
      deleteCookie("token");
      state.token = undefined;
    },
    getToken: (state) => {
      if (hasCookie("token")) state.token = getCookie("token")?.toString();
    },
  },
});

export const { removeToken, getToken } = token.actions;
export default token.reducer;
