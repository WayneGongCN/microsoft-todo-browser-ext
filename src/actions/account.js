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
  const { token } = state.account;

  if (!token || Date.now() >= token.expiresOn.getTime()) {
    dispatch({ type: types.GET_OAUTH_TOKEN_START });
    return msalInstance.getToken(options)
      .then((res) => {
        dispatch({ type: types.GET_OAUTH_TOKEN_SUCCESS, payload: res });
        return res;
      })
      .catch((error) => {
        dispatch({ type: types.GET_OAUTH_TOKEN_ERROR, payload: error });
        return Promise.reject(error);
      });
  }

  dispatch({ type: types.GET_OAUTH_TOKEN_NO_CHANGE });
  return Promise.resolve(token);
};
