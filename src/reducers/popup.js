import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  EDIT_POPUPFORM_BOOKMARKED, EDIT_POPUPFORM_DESCRIBE, EDIT_POPUPFORM_IMPORTANCE, EDIT_POPUPFORM_REMIND_DATETIME, EDIT_POPUPFORM_TASKLIST, EDIT_POPUPFORM_TITLE, RESET_POPUPFORM,
} from '../constants/popupTypes';

const initalState = {
  title: '',
  describe: '',
  reminderDateTime: '',
  tasklistId: '',
  importance: false,
  bookmarked: false,
};

function popupReducer(state = initalState, action) {
  switch (action.type) {
    case EDIT_POPUPFORM_TITLE: {
      const value = action.payload;
      return { ...state, title: value };
    }
    case EDIT_POPUPFORM_DESCRIBE: {
      const value = action.payload;
      return { ...state, describe: value };
    }
    case EDIT_POPUPFORM_REMIND_DATETIME: {
      const value = action.payload;
      return { ...state, reminderDateTime: value };
    }
    case EDIT_POPUPFORM_TASKLIST: {
      const value = action.payload;
      return { ...state, tasklistId: value };
    }
    case EDIT_POPUPFORM_IMPORTANCE: {
      const value = action.payload;
      return { ...state, importance: value };
    }
    case EDIT_POPUPFORM_BOOKMARKED: {
      const value = action.payload;
      return { ...state, bookmarked: value };
    }

    case RESET_POPUPFORM: {
      return { ...initalState, tasklistId: state.tasklistId };
    }

    default:
      return state;
  }
}

export default persistReducer({ key: 'popup', storage }, popupReducer);
