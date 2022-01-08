import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { State } from '.';
import { msalAcquireTokenSilent, msalAcquireTokenRedirect, msalGetAllAccounts } from '../helpers/msal';
import { AUTH_SCOPES } from '../constants';
import { bindAsyncActions } from '../helpers';
import AppError from '../helpers/error';
import { SerializAuthenticationResult } from '../../types';
import { ErrorCode } from '../constants/enums';

const SLICE_NAME = 'auth';
const initialState = {
  authenticationResult: null as null | SerializAuthenticationResult,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};

/**
 * 静默获取 Token
 * - 登录态过期不会拉起登录弹窗
 */
export const acquireTokenSilent = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/acquireTokenSilent`,
  (_) => {
    const accounts = msalGetAllAccounts();
    if (accounts.length) {
      return msalAcquireTokenSilent({ scopes: AUTH_SCOPES, account: accounts[0] });
    } else {
      return Promise.reject(new AppError({ code: ErrorCode.NOT_FOUND_ACCOUNT, message: 'Not found accounts' }));
    }
  }
);

/**
 * 刷新 Token
 * - 登录态有效则直接返回
 * - 登录态过期则会拉起登录弹窗
 */
export const acquireTokenRedirect = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/authenticationResult`,
  (_, { rejectWithValue }) =>
    msalAcquireTokenRedirect({ scopes: AUTH_SCOPES }).catch((e: AppError) => {
      return rejectWithValue(e.serializ());
    })
);

/**
 * 获取 Token
 * - 如果没有 Token 或 Token 过期，则调用 acquireTokenRedirect 刷新 Token
 * - 如果 Token 没有过期则直接返回
 */
export const acquireToken = createAsyncThunk<string, void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/acquireToken`,
  (_, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();
    const { authenticationResult } = auth;
    const now = Date.now();
    const needAuthentication = now > (authenticationResult?.expiresOn || 0);

    if (needAuthentication) {
      return dispatch(acquireTokenRedirect())
        .then((res) => (res.payload as SerializAuthenticationResult).accessToken)
        .catch((e) => rejectWithValue(e.serializ()));
    } else {
      return Promise.resolve(authenticationResult.accessToken);
    }
  }
);

export const authSlice = createSlice({
  name: SLICE_NAME,
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(acquireTokenRedirect.pending, (state) => {
        state.loading = true;
      })
      .addCase(acquireTokenRedirect.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(acquireTokenRedirect.rejected, (state) => {
        state.loading = false;
      })

      // acquireTokenSilent
      .addCase(acquireTokenSilent.pending, (state) => {
        state.loading = true;
      })
      .addCase(acquireTokenSilent.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(acquireTokenSilent.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const asyncChunk = {
  authentication: acquireTokenRedirect,
  acquireTokenSilent,
};
bindAsyncActions(authSlice, asyncChunk);

export default authSlice;
