import * as types from '../constants/PopupTypes';

export const editTask = (task) => ({ type: types.EDIT_TASK, payload: { task } });
export const editSelectedTasklist = (selectedTasklistId) => ({ type: types.EDIT_SELECTED_TASKLIST, payload: { selectedTasklistId } });
export const editBookmarked = (bookmarked) => ({ type: types.EDIT_BOOKMARKED, payload: { bookmarked } });
export const resetTask = () => ({ type: types.RESET_TASK });

export const createTask = (selectedTasklistId, task) => (dispatch, getState) => {
  const state = getState();
  const { tasklistList } = state.popup;
  const tasklist = tasklistList.find((x) => x.id === selectedTasklistId);
  dispatch({ type: types.CREATE_TASK_START, payload: { task } });
  return tasklist.createTask(task)
    .then((res) => dispatch({ type: types.CREATE_TASK_SUCCESS, payload: { task: res } }))
    .catch((error) => dispatch({ type: types.CREATE_TASK_ERROR, error }));
};

export const fetchTasklistList = () => (dispatch, getState) => {
  const state = getState();
  if (state.popup.tasklistListLoading) return Promise.reject();
  dispatch({ type: types.FETCH_TASKLIST_LIST_START });
  return new window.Tasklist().listTasklist()
    .then((res) => dispatch({ type: types.FETCH_TASKLIST_LIST_SUCCESS, payload: { tasklistList: res } }))
    .catch((error) => dispatch({ type: types.FETCH_TASKLIST_LIST_ERROR, payload: { error } }));
};
