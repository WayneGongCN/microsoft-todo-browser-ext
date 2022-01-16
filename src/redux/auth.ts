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
const acquireTokenSilent = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/acquireTokenSilent`,
  (_, { rejectWithValue }) => {
    const accounts = msalGetAllAccounts();
    if (accounts.length) {
      return msalAcquireTokenSilent({ scopes: AUTH_SCOPES, account: accounts[0] });
    } else {
      const err = new AppError({ code: ErrorCode.NOT_FOUND_ACCOUNT, message: 'Not found accounts' });
      rejectWithValue(err.serializ());
      return Promise.reject(err);
    }
  }
);

/**
 * 刷新 Token
 * - 登录态有效则直接返回
 * - 登录态过期则会拉起登录弹窗
 */
export const acquireTokenRedirect = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/acquireTokenRedirect`,
  (_, { rejectWithValue }) =>
    msalAcquireTokenRedirect({ scopes: AUTH_SCOPES }).catch((e: AppError) => {
      rejectWithValue(e.serializ());
      return Promise.reject(e);
    })
);

/**
 * 获取 Token
 * - 如果有 Token 且没有过期，则直接返回 Token
 * - 如果有 Token 但已经过期，则调用 acquireTokenSilent 刷新 Token，刷新失败则调用 acquireTokenRedirect 重新登陆
 * - 如果没有 Token 则调用 acquireTokenRedirect 重新登陆
 */
export const acquireToken = createAsyncThunk<string, boolean | void, { state: State; payload: SerializAuthenticationResult }>(
  `${SLICE_NAME}/acquireToken`,
  (silent = false, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();
    const { authenticationResult } = auth;
    const now = Date.now();
    const isExpires = now > (authenticationResult?.expiresOn || 0);

    if (isExpires && !silent) {
      return dispatch(acquireTokenSilent())
        .catch(() => dispatch(acquireTokenRedirect()))
        .then((res) => (res.payload as SerializAuthenticationResult).accessToken)
        .catch((e) => {
          rejectWithValue(e.serializ());
          return Promise.reject(e);
        });
    } else if (silent) {
      const err = new AppError({ code: ErrorCode.UNKNOW, message: 'Token expired but silent is true' });
      rejectWithValue(err.serializ());
      return Promise.reject(err);
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
  acquireTokenRedirect,
  acquireTokenSilent,
};
bindAsyncActions(authSlice, asyncChunk);

export default authSlice;
