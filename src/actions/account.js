import * as types from '../constants/AccountTypes';
import msalInstance from '../helpers/msal';

export const logout = () => (dispatch) => {
  dispatch({ type: types.LOG_OUT_START });
  return msalInstance.logout()
    .then((payload) => dispatch({ type: types.LOG_OUT_START, payload }))
    .catch((payload) => dispatch({ type: types.LOG_OUT_ERROR, payload }));
};

export const getOAuthToken = (options) => (dispatch, getState) => {
  const state = getState();
  let { token } = state.account;
  try {
    token = token || JSON.parse(localStorage.getItem('token'));
  } catch (e) {
    console.warn(e);
  }

  if (!token || Date.now() >= new Date(token.expiresOn).getTime()) {
    dispatch({ type: types.FETCH_OAUTH_TOKEN_START });
    return msalInstance.acquireTokenRedirect(options)
      .then((res) => {
        localStorage.setItem('token', JSON.stringify(res));
        dispatch({ type: types.FETCH_OAUTH_TOKEN_SUCCESS, payload: res });
        return res;
      })
      .catch((error) => {
        dispatch({ type: types.FETCH_OAUTH_TOKEN_ERROR, payload: error });
        return Promise.reject(error);
      });
  }

  dispatch({ type: types.GET_OAUTH_TOKEN_NO_CHANGE });
  return Promise.resolve(token);
};
