import * as types from '../constants/PopupTypes';

export const fetchTasklistList = () => (dispatch, getState) => {
  const state = getState();
  if (state.popup.tasklistListLoading) return Promise.reject();
  dispatch({ type: types.FETCH_TASKLIST_LIST_START });
  return new window.Tasklist().listTasklist()
    .then((res) => dispatch({ type: types.FETCH_TASKLIST_LIST_SUCCESS, payload: { tasklistList: res } }))
    .catch((error) => {
      dispatch({ type: types.FETCH_TASKLIST_LIST_ERROR, payload: { error } });
      return Promise.reject(error);
    });
};

export const editTaskTitle = (title) => ({ type: types.EDIT_TASK_TITLE, payload: { title } });
export const editTaskDescribe = (content) => ({ type: types.EDIT_TASK_CONTENT, payload: { content } });
export const editReminderDateTime = (dateTime) => ({ type: types.EDIT_TASK_REMINDER_DATETIME, payload: { dateTime } });
export const editSelectedTasklist = (selectedTasklistId) => ({ type: types.EDIT_SELECTED_TASKLIST, payload: { selectedTasklistId } });
export const editImportance = (importance) => ({ type: types.EDIT_IMPORTANCE, payload: { importance } });
export const editBookmarked = (bookmarked) => ({ type: types.EDIT_BOOKMARKED, payload: { bookmarked } });
export const resetTask = () => ({ type: types.RESET_TASK });

export const createTask = (selectedTasklistId, task, bookmarkInfo = null) => (dispatch, getState) => {
  const state = getState();
  const { tasklistList } = state.popup;
  const tasklist = tasklistList.find((x) => x.id === selectedTasklistId);
  if (!tasklistList) return dispatch({ type: types.CREATE_TASK_ERROR, error: 'Error tasklist' });

  dispatch({ type: types.CREATE_TASK_START, payload: { task, bookmarkInfo } });
  return tasklist.createTask(task, bookmarkInfo)
    .then((res) => dispatch({ type: types.CREATE_TASK_SUCCESS, payload: { task: res } }))
    .catch((error) => {
      dispatch({ type: types.CREATE_TASK_ERROR, error });
      return Promise.reject(error);
    });
};
