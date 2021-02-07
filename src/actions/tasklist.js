import { FETCH_TASKLIST_LIST_ERROR, FETCH_TASKLIST_LIST_START, FETCH_TASKLIST_LIST_SUCCESS } from '../constants/tasklist';

// Tasklist
export const fetchTasklistList = () => (dispatch) => {
  dispatch({ type: FETCH_TASKLIST_LIST_START });
  return new window.Tasklist().listTasklist()
    .then((res) => dispatch({ type: FETCH_TASKLIST_LIST_SUCCESS, payload: res }))
    .catch((error) => {
      dispatch({ type: FETCH_TASKLIST_LIST_ERROR, payload: error });
      return Promise.reject(error);
    });
};

export const a = {};
