import {
  CREATE_TASK_START, CREATE_TASK_SUCCESS, CREATE_TASK_ERROR, GET_ACCOUNTS, LOG_OUT_START, LOG_OUT_SUCCESS, LOG_OUT_ERROR, FETCH_OAUTH_TOKEN_START, FETCH_OAUTH_TOKEN_SUCCESS, FETCH_OAUTH_TOKEN_ERROR,
} from '../constants/appTypes';

// Task
export const createTask = (tasklistId, taskMeta) => (dispatch, getState) => {
  const { tasklistList } = getState().tasklist;
  const targetTasklist = tasklistList.find((x) => x.id === tasklistId);
  if (!targetTasklist) throw new Error('xxx');

  dispatch({ type: CREATE_TASK_START, payload: { tasklistId, taskMeta } });
  return targetTasklist.createTask(taskMeta)
    .then((task) => {
      dispatch({ type: CREATE_TASK_SUCCESS, payload: { tasklistId, taskMeta } });
      return task;
    })
    .catch((error) => {
      dispatch({ type: CREATE_TASK_ERROR, payload: error });
      return Promise.reject(error);
    });
};

// Account
export const getAccount = () => (dispatch) => {
  const accounts = window.msalInstance.getAllAccounts();
  const account = accounts[0] || null;
  dispatch({ type: GET_ACCOUNTS, payload: account });
};

export const logout = () => (dispatch) => {
  dispatch({ type: LOG_OUT_START });
  return window.msalInstance.logout()
    .then(() => dispatch({ type: LOG_OUT_SUCCESS }))
    .catch((error) => {
      dispatch({ type: LOG_OUT_ERROR, payload: { error } });
      return Promise.reject(error);
    });
};

export const getOAuthToken = (options) => (dispatch, getState) => {
  const state = getState();
  const { token, scopes, account } = state.app;

  if (!token || Date.now() >= new Date(token.expiresOn).getTime()) {
    dispatch({ type: FETCH_OAUTH_TOKEN_START });
    return window.msalInstance.acquireTokenRedirect({ scopes, account, ...options })
      .then((newToken) => {
        dispatch({ type: FETCH_OAUTH_TOKEN_SUCCESS, payload: newToken });
        return newToken;
      })
      .catch((error) => {
        dispatch({ type: FETCH_OAUTH_TOKEN_ERROR, payload: error });
        return Promise.reject(error);
      });
  }
  return Promise.resolve(token);
};
