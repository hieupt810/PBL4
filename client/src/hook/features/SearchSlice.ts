import { Users } from "@/app/types/users.type";
import http from "@/app/utils/http";
import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCookie } from "cookies-next";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;

type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface SearchType {
  userList: Users[];
}

const initialState: SearchType = {
  userList: [],
};

interface UserResponse {
  users: Users[];
}


export const getUserList = createAsyncThunk(
  "user/getUserList",
  async (_, thunkAPI) => {
    const token = getCookie("token");
    const response = await http.get<UserResponse>(`/api/user/list-user`, {
      headers : {
        token: `${token}`
      },
      signal: thunkAPI.signal,
    });
    return response.data.users;
  }
);

const searchSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder
      .addCase(getUserList.fulfilled, (state, action) => {
        state.userList = action.payload;
      })
  },
});

const searchReducer = searchSlice.reducer

export default searchReducer
