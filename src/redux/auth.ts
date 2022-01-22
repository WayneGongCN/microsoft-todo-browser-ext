import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { State } from '.';
import { msalAcquireTokenSilent, msalAcquireTokenRedirect, msalGetAllAccounts, logoutRedirect } from '../helpers/msal';
import { AUTH_SCOPES } from '../constants';
import { bindAsyncActions } from '../helpers';
import { SerializAuthenticationResult } from '../../types';
import { ErrorCode } from '../constants/enums';
import { logger } from '../helpers/logger';
import { now, timing } from '../helpers/report';

const SLICE_NAME = 'auth';
const initialState = {
  authenticationResult: null as null | SerializAuthenticationResult,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};

/**
 * 获取 Token
 * - 如果有 Token 且没有过期，则直接返回 Token
 * - 如果有 Token 但已经过期，则调用 acquireTokenSilent 刷新 Token，刷新失败则调用 acquireTokenRedirect 重新登陆
 * - 如果没有 Token 则调用 acquireTokenRedirect 重新登陆
 */
export const acquireToken = createAsyncThunk<SerializAuthenticationResult, boolean, { state: State }>(`${SLICE_NAME}/acquireToken`, (silent, { getState }) => {
  const { auth } = getState();
  const { authenticationResult } = auth;
  const curTime = Date.now();
  const isExpires = curTime > (authenticationResult?.expiresOn || 0);

  if (!isExpires) {
    return Promise.resolve(authenticationResult);
  } else {
    const startTime = now();
    const accounts = msalGetAllAccounts();
    return msalAcquireTokenSilent({ scopes: AUTH_SCOPES, account: accounts[0] })
      .catch((e) => {
        if (silent) {
          logger.warn('msalAcquireTokenSilent fail silent is true.');
          throw e;
        } else {
          logger.warn('msalAcquireTokenSilent fail try msalAcquireTokenRedirect.');
          return msalAcquireTokenRedirect({ scopes: AUTH_SCOPES }).catch((e) => {
            logger.warn('msalAcquireTokenRedirect fail');
            throw e;
          });
        }
      })
      .then((res) => {
        timing('acquireToken', now() - startTime);
        return res;
      });
  }
});

export const logout = createAsyncThunk<void, void, { state: State }>(`${SLICE_NAME}/logout`, (_) => {
  return logoutRedirect();
});

export const authSlice = createSlice({
  name: SLICE_NAME,
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(acquireToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(acquireToken.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(acquireToken.rejected, (state) => {
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

export const asyncChunk = {
  acquireToken,
  logout,
};
bindAsyncActions(authSlice, asyncChunk);

export default authSlice;
