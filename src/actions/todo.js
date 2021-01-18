import * as types from '../constants/TodoTypes';

const backgroundPage = chrome.extension.getBackgroundPage();
const { Tasklist } = backgroundPage;

// Task
export const editNewTask = (key, value) => ({ type: types.EDIT_NEW_TASK, payload: { key, value } });

export const resetNewTask = () => ({ type: types.RESET_NEW_TASK });

export const createNewTask = (taskListId) => (dispatch, getState) => {
  const state = getState();
  const { loadingCreateTask, newTask } = state.todo;
  if (loadingCreateTask) return Promise.reject();
  dispatch({ type: types.CREATE_NEW_TASK_START });
  const taskList = state.tasklistList.find((x) => x.id === taskListId);
  return taskList.create(newTask)
    .then((task) => dispatch({ type: types.CREATE_NEW_TASK_SUCCESS, payload: { task } }))
    .catch((error) => dispatch({ type: types.CREATE_NEW_TASK_ERROR, error }));
};

export const deletaTask = (taskListId, taskId) => (dispatch, getState) => {
  dispatch({ type: types.DELETE_TASK_START, payload: { taskListId, taskId } });
  const state = getState();
  const taskList = state.todo.taskList.find((x) => x.id === taskListId);
  const task = taskList.find((x) => x.id === taskId);
  return task.delete()
    .then(() => dispatch({ type: types.DELETE_TASK_SUCCESS, payload: { taskListId, taskId } }))
    .catch((error) => dispatch({ type: types.DELETE_TASK_ERROR, error }));
};

export const editTask = (taskListId, taskId, key, value) => ({
  type: types.EDIT_TASK,
  payload: {
    taskListId, taskId, key, value,
  },
});

export const updateTask = (taskListId, taskId) => (dispatch, getState) => {
  dispatch({ type: types.UPDATE_TASK_START, payload: { taskListId, taskId } });
  const state = getState();
  const taskList = state.taskList.find((x) => x.id === taskListId) || [];
  const task = taskList.getTask(taskId);
  return task.update()
    // eslint-disable-next-line no-shadow
    .then((task) => dispatch({ type: types.UPDATE_TASK_SUCCESS, payload: { task } }))
    .catch((error) => dispatch({ type: types.UPDATE_TASK_ERROR, error }));
};

// Tasklist
export const addNewTasklist = () => ({ type: types.ADD_NEW_TASK_LIST });

// eslint-disable-next-line max-len
export const editNewTasklist = (key, value) => ({ type: types.EDIT_NEW_TASK, payload: { key, value } });

export const deleteNewTasklist = () => ({ type: types.RESET_NEW_TASK_LIST });

export const createNewTasklist = (taskListId) => (dispatch, getState) => {
  dispatch({ type: types.CREATE_NEW_TASK_LIST_START, payload: { taskListId } });
  const state = getState();
  const taskList = state.newTasklist;
  return new Tasklist(taskList).create()
    .then((res) => dispatch({ type: types.CREATE_NEW_TASK_LIST_SUCCESS, payload: res }))
    .catch((error) => dispatch({ type: types.CREATE_NEW_TASK_LIST_ERROR, error }));
};

export const deleteTasklist = (taskListId) => (dispatch, getState) => {
  dispatch({ type: types.DELETE_TASK_LIST_START, payload: { taskListId } });
  const state = getState();
  const taskList = state.taskList.find((x) => x.id === taskListId);
  return taskList.delete()
    .then((res) => dispatch({ type: types.DELETE_TASK_LIST_SUCCESS, payload: res }))
    .catch((error) => dispatch({ type: types.DELETE_TASK_LIST_ERROR, error }));
};

// eslint-disable-next-line max-len
export const editTasklist = (taskListId, key, value) => ({ type: types.EDIT_TASK_LIST, payload: { taskListId, key, value } });

export const updateTasklist = (taskListId) => (dispatch, getState) => {
  dispatch({ type: types.DELETE_TASK_LIST_START, payload: { taskListId } });
  const state = getState();
  const taskList = state.taskList.find((x) => x.id === taskListId);
  return taskList.update()
    .then((res) => dispatch({ type: types.DELETE_TASK_LIST_SUCCESS, payload: res }))
    .catch((error) => dispatch({ type: types.DELETE_TASK_LIST_ERROR, error }));
};
