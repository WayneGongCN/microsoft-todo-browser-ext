import {
  SET_POPUPFORM_AUTO_CLEAR,
  SET_POPUPFORM_NOTIFY,
  SET_DEFAULT_TASKLIST_ID,
} from '../constants/config';

export const setPopupformAutoClear = (payload) => ({ type: SET_POPUPFORM_AUTO_CLEAR, payload });
export const setpopupformNotify = (payload) => ({ type: SET_POPUPFORM_NOTIFY, payload });
export const setDefaultTasklistId = (payload) => ({ type: SET_DEFAULT_TASKLIST_ID, payload });
