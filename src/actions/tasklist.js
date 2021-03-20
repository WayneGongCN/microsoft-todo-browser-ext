/* eslint-disable import/prefer-default-export */
import { FETCH_TASKLIST_LIST_ERROR, FETCH_TASKLIST_LIST_START, FETCH_TASKLIST_LIST_SUCCESS } from '../constants/tasklist';

/**
 * Fetch tasklists
 */
export const fetchTasklists = () => (dispatch) => {
  dispatch({ type: FETCH_TASKLIST_LIST_START });
  return window.Tasklist.fetchTasklists()
    .then((res) => {
      dispatch({ type: FETCH_TASKLIST_LIST_SUCCESS, payload: res });
      return res;
    })
    .catch((error) => {
      dispatch({ type: FETCH_TASKLIST_LIST_ERROR, payload: error });
      return Promise.reject(error);
    });
};
