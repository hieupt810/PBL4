import { Users } from "@/app/types/users.type";
import http from "@/app/utils/http";
import { Member } from "@/models/member";
import {
  AsyncThunk,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Reducer,
} from "@reduxjs/toolkit";
import { getCookie } from "cookies-next";
import { useSearchParams } from "next/navigation";
import { RootState } from "../store";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;

type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface SearchType {
  userList: Users[];
  memberList: Member[];
  home_id: string;
}

const initialState: SearchType = {
  userList: [],
  memberList: [],
  home_id: "",
};

interface UserResponse {
  users: Users[];
}
interface MemberResponse {
  data: {members: Member[]};
}

export const getUserList = createAsyncThunk(
  "user/getUserList",
  async (_, thunkAPI) => {
    const token = getCookie("token");
    const response = await http.get<UserResponse>(`/api/user`, {
      headers: {
        token: `${token}`,
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
    const { home_id } = (thunkAPI.getState() as RootState).search;
    const response = await http.get<MemberResponse>(
      `api/home/${home_id}/member`,
      {
        headers: {
          token: `${token}`,
        },
        signal: thunkAPI.signal,
      }
    );
    console.log(response.data.data.members);
    return response.data.data.members;
  }
);

const searchSlice = createSlice({
  name: "users",
  initialState,

  reducers: {
    setHomeId: (state, action: PayloadAction<string>) => {
      state.home_id = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUserList.fulfilled, (state, action) => {
        state.userList = action.payload;
      })
      .addCase(getMemberList.fulfilled, (state, action) => {
        state.memberList = action.payload;
      });
  },
});


const searchReducer = searchSlice.reducer;
export const { setHomeId } = searchSlice.actions;
export default searchReducer;
