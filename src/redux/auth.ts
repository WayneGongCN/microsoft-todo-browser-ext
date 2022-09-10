import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { State } from '.';
import { msalAcquireToken, msalLogin, msalLogout } from '../helpers/msal';
import { AUTH_SCOPES } from '../constants';
import { SerializAuthenticationResult } from '../../types';
import { ErrorCode } from '../constants/enums';
import { logger } from '../helpers/logger';



const SLICE_NAME = 'auth';
const initialState = {
  authenticationResult: null as null | SerializAuthenticationResult,
  loading: false,
  error: null as null | { code: ErrorCode; message: string },
};



/**
 * 
 */
export const loginAction = createAsyncThunk<SerializAuthenticationResult, void, { state: State, payload: SerializAuthenticationResult }>(`${SLICE_NAME}/login`, () => {
  return msalLogin();
});



/**
 * 
 */
export const acquireTokenAction = createAsyncThunk<SerializAuthenticationResult, void, { state: State }>(
  `${SLICE_NAME}/acquireToken`,
  async (_, { getState, dispatch }) => {
    let account = getState().auth.authenticationResult?.account;
    if (!account) {
      logger.warn('Not found account, fallback to login')
      account =  await (await dispatch(loginAction()).unwrap()).account;
    }

    return msalAcquireToken({ scopes: AUTH_SCOPES, account });
  }
);



/**
 * 
 */
export const logoutAction = createAsyncThunk<void, void, { state: State }>(`${SLICE_NAME}/logout`, () => {
  return msalLogout();
});



/**
 * 
 */
const authSlice = createSlice({
  name: SLICE_NAME,
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      /**
       * acquireTokenAction
       */
      .addCase(acquireTokenAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(acquireTokenAction.fulfilled, (state, { payload }) => {
        const oldToken = state.authenticationResult?.accessToken;
        const newToken = payload.accessToken;
        if (oldToken !== newToken) state.authenticationResult = payload;

        state.loading = false;
      })
      .addCase(acquireTokenAction.rejected, (state) => {
        state.loading = false;
      })


      /**
       * loginAction
       */
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAction.fulfilled, (state, { payload }) => {
        state.authenticationResult = payload;
        state.loading = false;
      })
      .addCase(loginAction.rejected, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      })


      /**
       * logoutAction
       */
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      })
      .addCase(logoutAction.rejected, (state) => {
        state.authenticationResult = null;
        state.loading = false;
      });
  },
});

export default authSlice;
