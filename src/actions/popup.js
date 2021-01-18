import * as types from '../constants/PopupTypes';

const backgroundPage = chrome.extension.getBackgroundPage();
const { Tasklist } = backgroundPage;

// Task
export const editTitle = (value) => ({ type: types.EDIT_TITLE, payload: { value } });
export const editBody = (value) => ({ type: types.EDIT_BODY, payload: { value } });
export const editTasklist = (value) => ({ type: types.EDIT_TASKLIST, payload: { value } });
export const editReminderDate = (value) => ({ type: types.EDIT_REMINDER_DATE, payload: { value } });
export const editBookmarks = (value) => ({ type: types.EDIT_BOOKMARKS, payload: { value } });
export const editImportance = (value) => ({ type: types.EDIT_IMPORTANCE, payload: { value } });
export const resetTask = () => ({ type: types.RESET_TASK });

export const createTask = (selectedTasklist, task) => (dispatch, getState) => {
  const state = getState();
  const { taskCreating } = state.popup;
  if (taskCreating) return Promise.reject();
  dispatch({ type: types.CREATE_TASK_START });
  return selectedTasklist.createTask(task)
    .then((res) => dispatch({ type: types.CREATE_TASK_SUCCESS, payload: { task: res } }))
    .catch((error) => dispatch({ type: types.CREATE_TASK_ERROR, error }));
};

export const fetchTasklistList = () => (dispatch, getState) => {
  const state = getState();
  if (state.popup.tasklistListLoading) return Promise.reject();
  dispatch({ type: types.FETCH_TASKLIST_LIST_START });
  return new Tasklist().listTasklist()
    .then((res) => dispatch({ type: types.FETCH_TASKLIST_LIST_SUCCESS, payload: { tasklistList: res } }))
    .catch((error) => dispatch({ type: types.FETCH_TASKLIST_LIST_ERROR, payload: { error } }));
};
