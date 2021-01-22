import * as types from '../constants/AccountTypes';

export const getAccount = () => (dispatch) => {
  const accounts = window.msalInstance.getAllAccounts();
  const account = accounts[0] || null;
  dispatch({ type: types.GET_ACCOUNTS, payload: { account } });
};

export const logout = () => (dispatch) => {
  dispatch({ type: types.LOG_OUT_START });
  return window.msalInstance.logout()
    .then((payload) => dispatch({ type: types.LOG_OUT_START, payload }))
    .catch((payload) => dispatch({ type: types.LOG_OUT_ERROR, payload }));
};

export const getOAuthToken = (options) => (dispatch, getState) => {
  const state = getState();
  const { token, scopes, account } = state.account;
  if (!token || Date.now() >= new Date(token.expiresOn).getTime()) {
    dispatch({ type: types.FETCH_OAUTH_TOKEN_START });
    return window.msalInstance.acquireTokenRedirect({ scopes, account, ...options })
      .then((token) => {
        dispatch({ type: types.FETCH_OAUTH_TOKEN_SUCCESS, payload: { token } });
        return token;
      })
      .catch((error) => {
        dispatch({ type: types.FETCH_OAUTH_TOKEN_ERROR, payload: error });
        return Promise.reject(error);
      });
  }

  dispatch({ type: types.GET_OAUTH_TOKEN_NO_CHANGE });
  return Promise.resolve(token);
};
