import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { State } from '.';
import { msalAcquireTokenSilent, msalAuthentication } from '../helpers/msal';
import { AUTH_SCOPES } from '../constants';
import { bindAsyncActions } from '../helpers';
import { ErrorCode } from '../helpers/error';
import { SerializAuthenticationResult } from '../../types';

const initialState = {
  authenticationResult: null as null | SerializAuthenticationResult,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};

/**
 * 登录 MS 账号
 */
export const authentication = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  'app/authenticationResult',
  () => msalAuthentication({ scopes: AUTH_SCOPES })
);

export const acquireTokenSilent = createAsyncThunk<SerializAuthenticationResult, void, { state: State; payload: SerializAuthenticationResult }>(
  'app/acquireTokenSilent',
  () => {
    return msalAcquireTokenSilent({ scopes: AUTH_SCOPES });
  }
);

/**
 * 获取 Access Token
 */
export const getAccessToken = createAsyncThunk<string, void, { state: State }>('app/getAccessToken', (_, { getState, dispatch }) => {
  const { auth } = getState();
  const { authenticationResult } = auth;
  const now = Date.now();
  const needAuthentication = now > (authenticationResult?.expiresOn || 0);

  if (needAuthentication) {
    return dispatch(authentication()).then((res) => (res.payload as SerializAuthenticationResult).accessToken);
  } else {
    return Promise.resolve(authenticationResult.accessToken);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(authentication.pending, (state) => {
        state.loading = true;
      })
      .addCase(authentication.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(authentication.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const asyncChunk = {
  authentication,
};
bindAsyncActions(authSlice, asyncChunk);

export default authSlice;
