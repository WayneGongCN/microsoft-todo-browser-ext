import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from ".";
import { authentication as msalAuthentication } from "../helpers/msal";
import { AUTH_SCOPE } from "../constants";
import { bindAsyncActions } from "../helpers";
import { ErrorCode } from "../helpers/error";
import { serializAuthenticationResult } from "../../types";

const initialState = {
  authenticationResult: null as null | serializAuthenticationResult,
  scopes: AUTH_SCOPE,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};

/**
 * 登录 MS 账号
 */
export const authentication = createAsyncThunk<serializAuthenticationResult>(
  "app/authenticationResult",
  (_, { getState }) => {
    const state = getState() as State;
    const scopes = state.auth.scopes;
    return msalAuthentication({ scopes })
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(authentication.pending, (state, { payload }) => {
        state.loading = true;
      })
      .addCase(authentication.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(authentication.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const asyncChunk = {
  authentication,
};
bindAsyncActions(authSlice, asyncChunk);

export default authSlice;
