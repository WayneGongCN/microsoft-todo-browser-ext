// TODO: refactor with React Final Form
import {
  EDIT_POPUPFORM_BOOKMARKED, EDIT_POPUPFORM_DESCRIBE, EDIT_POPUPFORM_IMPORTANCE, EDIT_POPUPFORM_REMIND_DATETIME, EDIT_POPUPFORM_TASKLIST, EDIT_POPUPFORM_TITLE, RESET_POPUPFORM, POPUPFORM_SUBMIT,
} from '../constants/popupTypes';

import { createTask } from './app';

export const editTitle = (payload) => ({ type: EDIT_POPUPFORM_TITLE, payload });
export const editDescribe = (payload) => ({ type: EDIT_POPUPFORM_DESCRIBE, payload });
export const editReminderDateTime = (payload) => ({ type: EDIT_POPUPFORM_REMIND_DATETIME, payload });
export const editTasklist = (payload) => ({ type: EDIT_POPUPFORM_TASKLIST, payload });
export const editImportance = (payload) => ({ type: EDIT_POPUPFORM_IMPORTANCE, payload });
export const editBookmarked = (payload) => ({ type: EDIT_POPUPFORM_BOOKMARKED, payload });
export const resetPopupform = () => ({ type: RESET_POPUPFORM });

export const popupformSubmit = (tasklistId, taskMeta) => (dispatch, getState) => {
  const { popupformAutoClear } = getState().config;
  dispatch({ type: POPUPFORM_SUBMIT, payload: { tasklistId, taskMeta } });
  return createTask(tasklistId, taskMeta)(dispatch, getState)
    .then(() => {
      if (popupformAutoClear) dispatch(resetPopupform());
    });
};
