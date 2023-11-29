
import { Users } from "@/app/types/users.type";
import http from "@/app/utils/http";
import { Member } from "@/models/member";
import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCookie } from "cookies-next";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;

type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface SearchType {
  userList: Users[];
  memberList: Member[];
}

const initialState: SearchType = {
  userList: [],
  memberList: [],
};



interface UserResponse {
  users: Users[];
}
interface MemberResponse {
  members: Member[];
}


export const getUserList = createAsyncThunk(
  "user/getUserList",
  async (_, thunkAPI) => {
    const token = getCookie("token");
    const response = await http.get<UserResponse>(`/api/user`, {
      headers : {
        token: `${token}`
      },
      signal: thunkAPI.signal,
    });
    return response.data.users;
  }
);

export const getMemberList = createAsyncThunk(
  "user/getMemberList",
  async (_, thunkAPI) => {
    const token = getCookie("token");
    const response = await http.get<MemberResponse>(`api/home/list-member`, {
      headers : {
        token: `${token}`
      },
      signal: thunkAPI.signal,
    });
    return response.data.members;
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
      .addCase(getMemberList.fulfilled, (state, action) => {
        state.memberList = action.payload;
      })
  },
});

const searchReducer = searchSlice.reducer

export default searchReducer
