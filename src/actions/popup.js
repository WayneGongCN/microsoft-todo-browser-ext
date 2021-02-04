import {
  EDIT_POPUPFORM_BOOKMARKED, EDIT_POPUPFORM_DESCRIBE, EDIT_POPUPFORM_IMPORTANCE, EDIT_POPUPFORM_REMIND_DATETIME, EDIT_POPUPFORM_TASKLIST, EDIT_POPUPFORM_TITLE, RESET_POPUPFORM,
} from '../constants/popupTypes';

export const editTitle = (payload) => ({ type: EDIT_POPUPFORM_TITLE, payload });
export const editDescribe = (payload) => ({ type: EDIT_POPUPFORM_DESCRIBE, payload });
export const editRemindDateTime = (payload) => ({ type: EDIT_POPUPFORM_REMIND_DATETIME, payload });
export const editTasklist = (payload) => ({ type: EDIT_POPUPFORM_TASKLIST, payload });
export const editImportance = (payload) => ({ type: EDIT_POPUPFORM_IMPORTANCE, payload });
export const editBookmarked = (payload) => ({ type: EDIT_POPUPFORM_BOOKMARKED, payload });
export const resetPopupform = () => ({ type: RESET_POPUPFORM });
