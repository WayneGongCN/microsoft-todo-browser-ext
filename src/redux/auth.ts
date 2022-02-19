import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { State } from '.';
import { msalAcquireToken, msalLogin, msalLogout } from '../helpers/msal';
import { AUTH_SCOPES } from '../constants';
import { SerializAuthenticationResult } from '../../types';
import { ErrorCode } from '../constants/enums';
import AppError from '../helpers/error';

const SLICE_NAME = 'auth';
const initialState = {
  authenticationResult: null as null | SerializAuthenticationResult,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};

export const login = createAsyncThunk<SerializAuthenticationResult, void, { state: State }>(`${SLICE_NAME}/login`, () => {
  return msalLogin();
});

export const acquireToken = createAsyncThunk<SerializAuthenticationResult, boolean, { state: State }>(
  `${SLICE_NAME}/acquireToken`,
  (silen = true, { getState }) => {
    const account = getState().auth.authenticationResult?.account;
    if (account) return msalAcquireToken({ scopes: AUTH_SCOPES, account }, silen);
    else throw new AppError({ code: ErrorCode.ACQUIRE_TOKEN, message: 'acquireToken action not found account' });
  }
);

export const logout = createAsyncThunk<void, void, { state: State }>(`${SLICE_NAME}/logout`, () => {
  return msalLogout();
});

const authSlice = createSlice({
  name: SLICE_NAME,
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(acquireToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(acquireToken.fulfilled, (state, { payload }) => {
        const oldToken = state.authenticationResult?.accessToken;
        const newToken = payload.accessToken;
        if (oldToken !== newToken) state.authenticationResult = payload;

        state.loading = false;
      })
      .addCase(acquireToken.rejected, (state) => {
        state.loading = false;
      })

      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      })

      // logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      });
  },
});

export default authSlice;
