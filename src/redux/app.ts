import { RedirectRequest } from "@azure/msal-browser";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from ".";
import { authentication as msalAuthentication } from "../helpers/msal";
import request from "../helpers/request";
import { AuthenticationResult } from "@azure/msal-browser";

export const authentication = createAsyncThunk(
  "app/authenticationResult",
  (params: any, { getState }) => {
    const state = getState() as State;
    const scopes = state.app.scopes;
    return msalAuthentication({ scopes }).then((res) =>
      JSON.parse(JSON.stringify(res))
    );
  }
);

export const getTasklist = createAsyncThunk(
  "app/tasklist",
  (params: any, { getState }) => {
    const state = getState() as State;
    const headers = {
      Authorization: `Bearer ${state.app.authenticationResult.accessToken}`,
    };
    return request.get("me/todo/lists", {
      headers,
    }).then(res => res.data)
  }
);


export const appSlice = createSlice({
  name: "app",

  initialState: {
    authenticationResult: null as null | AuthenticationResult,
    scopes: ["profile", "Tasks.ReadWrite"],
    tasklist: [],
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(authentication.fulfilled, (state, action) => {
        state.authenticationResult = action.payload;
      })
      .addCase(getTasklist.fulfilled, (state, action) => {
        state.tasklist = action.payload.data.value;
      })
  },
});



export const asyncChunk = {
  authentication,
  getTasklist
}
// @ts-ignore
appSlice.authentication = authentication;
// @ts-ignore
appSlice.getTasklist = getTasklist;

export default appSlice;
