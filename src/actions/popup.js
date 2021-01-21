import * as types from '../constants/PopupTypes';

// Message
export const openSuccessMessage = (message) => ({ type: types.OPEN_SUCCESS_MESSAGE, payload: { message } });
export const openErrorMessage = (message) => ({ type: types.OPEN_ERROR_MESSAGE, payload: { message } });
export const closeMessage = () => ({ type: types.CLOSE_MESSAGE });

// Tasklist
export const fetchTasklistList = () => (dispatch) => {
  dispatch({ type: types.FETCH_TASKLIST_LIST_START });
  return new window.Tasklist().listTasklist()
    .then((res) => dispatch({ type: types.FETCH_TASKLIST_LIST_SUCCESS, payload: { tasklistList: res } }))
    .catch((error) => {
      dispatch({ type: types.FETCH_TASKLIST_LIST_ERROR, payload: { error } });
      let message = '';
      if (error.statusText && error.status) {
        message = `Error: ${error.statusText} ${error.status}`;
      } else if (error.message) {
        message = error.message;
      } else {
        message = error.toString();
      }
      dispatch(openErrorMessage(message));
      return Promise.reject(error);
    });
};

// Edit
export const editTaskTitle = (title) => ({ type: types.EDIT_TASK_TITLE, payload: { title } });
export const editTaskDescribe = (content) => ({ type: types.EDIT_TASK_CONTENT, payload: { content } });
export const editReminderDateTime = (dateTime) => ({ type: types.EDIT_TASK_REMINDER_DATETIME, payload: { dateTime } });
export const editSelectedTasklist = (selectedTasklistId) => ({ type: types.EDIT_SELECTED_TASKLIST, payload: { selectedTasklistId } });
export const editImportance = (importance) => ({ type: types.EDIT_IMPORTANCE, payload: { importance } });
export const editBookmarked = (bookmarked) => ({ type: types.EDIT_BOOKMARKED, payload: { bookmarked } });
export const resetTask = () => ({ type: types.RESET_TASK });

// Create
export const createTask = (selectedTasklistId, task, bookmarkInfo) => (dispatch, getState) => {
  const state = getState();
  const { tasklistList } = state.popup;
  const tasklist = tasklistList.find((x) => x.id === selectedTasklistId);
  if (!tasklistList) return dispatch({ type: types.CREATE_TASK_ERROR, error: 'Error tasklist' });

  dispatch({ type: types.CREATE_TASK_START, payload: { task, bookmarkInfo } });
  return tasklist.createTask(task, bookmarkInfo)
    .then((res) => dispatch({ type: types.CREATE_TASK_SUCCESS, payload: { task: res } }))
    .then(() => dispatch(resetTask()))
    .then(() => dispatch(openSuccessMessage('Success')))
    .catch((error) => {
      dispatch({ type: types.CREATE_TASK_ERROR, error });
      let message = '';
      if (error.statusText && error.status) {
        message = `Error: ${error.statusText} ${error.status}`;
      } else if (error.message) {
        message = error.message;
      } else {
        message = error.toString();
      }
      dispatch(openErrorMessage(message));
      return Promise.reject(error);
    });
};

export const createBookmarkedTask = (selectedTasklistId, task) => (dispatch) => new Promise((resolve, reject) => {
  try {
    chrome.tabs.query({ active: true }, (tab) => {
      const curTab = tab[0] || null;
      resolve((curTab && `\n\n---\n${curTab.title}\n${curTab.url}`) || null);
    });
  } catch (e) {
    reject(e);
  }
})
  .then((bookmarkInfo) => dispatch(createTask(selectedTasklistId, task, bookmarkInfo)));
