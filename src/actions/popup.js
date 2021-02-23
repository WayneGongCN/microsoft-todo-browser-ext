import {
  EDIT_POPUPFORM_BOOKMARKED, EDIT_POPUPFORM_DESCRIBE, EDIT_POPUPFORM_IMPORTANCE, EDIT_POPUPFORM_REMIND_DATETIME, EDIT_POPUPFORM_TASKLIST, EDIT_POPUPFORM_TITLE, RESET_POPUPFORM, POPUPFORM_SUBMIT,
} from '../constants/popupTypes';

import { createTask } from './app';
import { showNavigateNotify } from '../helpers';

export const editTitle = (payload) => ({ type: EDIT_POPUPFORM_TITLE, payload });
export const editDescribe = (payload) => ({ type: EDIT_POPUPFORM_DESCRIBE, payload });
export const editReminderDateTime = (payload) => ({ type: EDIT_POPUPFORM_REMIND_DATETIME, payload });
export const editTasklist = (payload) => ({ type: EDIT_POPUPFORM_TASKLIST, payload });
export const editImportance = (payload) => ({ type: EDIT_POPUPFORM_IMPORTANCE, payload });
export const editBookmarked = (payload) => ({ type: EDIT_POPUPFORM_BOOKMARKED, payload });
export const resetPopupform = () => ({ type: RESET_POPUPFORM });

export const popupformSubmit = (tasklistId, taskMeta) => (dispatch, getState) => {
  const { config: { popupformAutoClear, popupformNotify } } = getState();
  dispatch({ type: POPUPFORM_SUBMIT, payload: { tasklistId, taskMeta } });
  return createTask(tasklistId, taskMeta)(dispatch, getState)
    .then((task) => {
      if (popupformAutoClear) dispatch(resetPopupform());
      if (popupformNotify) showNavigateNotify(task, 'Create task success', 'Open task on Microsoft To-Do.');
    });
};
