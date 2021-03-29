/* eslint-disable no-shadow */
import {
  CREATE_TASK_START, CREATE_TASK_SUCCESS, CREATE_TASK_ERROR, GET_ACCOUNTS, LOG_OUT_START, LOG_OUT_SUCCESS, LOG_OUT_ERROR, FETCH_OAUTH_TOKEN_START, FETCH_OAUTH_TOKEN_SUCCESS, FETCH_OAUTH_TOKEN_ERROR,
} from '../constants/appTypes';
import {
  getActiveTab, makeBookmarkInfo, showNotify, showTaskNotify,
} from '../helpers';


/**
 * Create task action.
 * @param {Number} tasklistId Tasklist id.
 * @param {Object} taskMeta Task meta info.
 * @returns
 */
export const createTask = (tasklistId, taskMeta, quickAdd = false) => (dispatch, getState) => {
  const { tasklistList } = getState().tasklist;
  const selectedTasklist = tasklistList.find((x) => x.id === tasklistId);

  if (!selectedTasklist) throw new Error('Please select a task list first.');
  dispatch({ type: CREATE_TASK_START, payload: { tasklistId, taskMeta } });


  let result = null;
  if (taskMeta.bookmarked) {
    result = getActiveTab()
      .then((tab) => makeBookmarkInfo(tab, quickAdd))
      .then((bookmarkInfo) => ({ ...taskMeta, bookmarkInfo }))
      .then((taskMeta) => selectedTasklist.createTask(taskMeta));
  } else {
    result = selectedTasklist.createTask(taskMeta);
  }

  return result
    .then((task) => {
      dispatch({ type: CREATE_TASK_SUCCESS, payload: task });
      return task;
    })

    // show notify
    .then((task) => {
      showTaskNotify(task, 'Create task success', 'Open task on Microsoft To-Do.');
    })

    .catch((error) => {
      dispatch({ type: CREATE_TASK_ERROR, payload: error });
      showNotify('Error', error.message);
      return Promise.reject(error);
    });
};


/**
 * Get logined microsoft account info.
 * @returns account object or null.
 */
export const getAccount = () => (dispatch) => {
  const accounts = window.msalInstance.getAllAccounts();
  const account = accounts[0] || null;

  dispatch({ type: GET_ACCOUNTS, payload: account });
  return accounts;
};


/**
 * Logout microsoft account.
 * @returns
 */
export const logout = () => (dispatch) => {
  dispatch({ type: LOG_OUT_START });

  return window.msalInstance.logout()
    .then(() => dispatch({ type: LOG_OUT_SUCCESS }))
    .catch((error) => {
      dispatch({ type: LOG_OUT_ERROR, payload: { error } });
      return Promise.reject(error);
    });
};


/**
 * Get OAuth token
 */
export const getOAuthToken = (options) => (dispatch, getState) => {
  const state = getState();
  const { token, scopes, account } = state.app;

  if (token && Date.now() < new Date(token.expiresOn).getTime()) return Promise.resolve(token);

  /**
   * if not have token or token is expiresed
   * fetch new token with msalInstance.acquireTokenRedirect
   */
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
};
