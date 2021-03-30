/* eslint-disable no-shadow */
import { RedirectRequest } from '@azure/msal-browser';
import { AccountInfo } from '@azure/msal-common';
import { createAction } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { EAppActionTypes } from '../constants/enums';
import { makeBookmarkInfo, showNavigateNotify } from '../helpers/index';

/**
 * Create task action.
 * @param {Number} tasklistId Tasklist id.
 * @param {Object} task Task meta info.
 * @returns
 */
export const createTask = (tasklistId: string, task: ITaskProperty) => (dispatch, getState) => {
  const { tasklists } = getState();
  const selectedTasklist = tasklists.find((x) => x.id === tasklistId);

  if (!selectedTasklist) throw new Error('Please select a task list first.');
  dispatch({ type: EAppActionTypes.CREATE_TASK_START, payload: { tasklistId, taskMeta: task } });

  return makeBookmarkInfo()
    // Merge bookmarkInfo to taskMeta
    .then((bookmarkInfo) => ({ ...task, bookmarkInfo }))

    // Create task by selected tasklist instance.
    .then((taskMeta) => selectedTasklist.createTask(taskMeta))
    .then((task) => {
      dispatch({ type: EAppActionTypes.CREATE_TASK_SUCCESS, payload: task });
      return task;
    })

    // show notify
    .then((task) => {
      showNavigateNotify(task, 'Create task success', 'Open task on Microsoft To-Do.');
    })

    .catch((error) => {
      dispatch({ type: EAppActionTypes.CREATE_TASK_ERROR, payload: error });
      return Promise.reject(error);
    });
};


/**
 * Get logined microsoft account info.
 * @returns account object or null.
 */
// export const getAccount = ()=> (dispatch) => {
//   const accounts = window.msalInstance.getAllAccounts();
//   const account = accounts[0] || null;

//   dispatch({ type: , payload: account });
//   return accounts;
// };

const action = createAction<AccountInfo, EAppActionTypes>(EAppActionTypes.GET_ACCOUNTS)

/**
 * Logout microsoft account.
 * @returns
 */
export const logout = () => (dispatch) => {
  dispatch({ type: EAppActionTypes.LOG_OUT_START });

  return window.msalInstance.logout()
    .then(() => dispatch({ type: EAppActionTypes.LOG_OUT_SUCCESS }))
    .catch((error) => {
      dispatch({ type: EAppActionTypes.LOG_OUT_ERROR, payload: { error } });
      return Promise.reject(error);
    });
};


/**
 * Get OAuth token
 */
export const getOAuthToken = (options?: RedirectRequest) => (dispatch, getState) => {
  const state = getState();
  const { token, scopes, account } = state.app;

  if (token && Date.now() < new Date(token.expiresOn).getTime()) return Promise.resolve(token);

  /**
   * if not have token or token is expiresed
   * fetch new token with msalInstance.acquireTokenRedirect
   */
  dispatch({ type: EAppActionTypes.FETCH_OAUTH_TOKEN_START });
  return window.msalInstance.acquireTokenRedirect({ scopes, account, ...options })
    .then((newToken) => {
      dispatch({ type: EAppActionTypes.FETCH_OAUTH_TOKEN_SUCCESS, payload: newToken });
      return newToken;
    })
    .catch((error) => {
      dispatch({ type: EAppActionTypes.FETCH_OAUTH_TOKEN_ERROR, payload: error });
      return Promise.reject(error);
    });
};



/**
 * Fetch tasklists
 */
 export const fetchTasklists = () => (dispatch) => {
  dispatch({ type: EAppActionTypes.FETCH_TASKLIST_LIST_START });
  return window.Tasklist.fetchTasklists()
    .then((res) => {
      dispatch({ type: EAppActionTypes.FETCH_TASKLIST_LIST_SUCCESS, payload: res });
      return res;
    })
    .catch((error) => {
      dispatch({ type: EAppActionTypes.FETCH_TASKLIST_LIST_ERROR, payload: error });
      return Promise.reject(error);
    });
};
