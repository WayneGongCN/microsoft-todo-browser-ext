import {
  CREATE_TASK_ERROR,
  CREATE_TASK_START,
  CREATE_TASK_SUCCESS,
  EDIT_BODY,
  EDIT_BOOKMARKS,
  EDIT_REMINDER_DATE,
  EDIT_IMPORTANCE,
  EDIT_TASKLIST,
  EDIT_TITLE,
  RESET_TASK,
  FETCH_TASKLIST_LIST_START,
  FETCH_TASKLIST_LIST_SUCCESS,
  FETCH_TASKLIST_LIST_ERROR,
} from '../constants/PopupTypes';

const defaultTask = () => ({
  body: {
    content: '',
    contentType: 'text',
  },
  reminderDateTime: null,
  importance: '',
  title: '',
});

const initialState = {
  task: defaultTask(),
  taskCreating: false,

  selectedBookmarks: false,

  tasklistList: [],
  selectedTasklist: null,
  tasklistListLoading: false,
};

function popup(state = initialState, action) {
  switch (action.type) {
    // Task
    case EDIT_TITLE: {
      const { value } = action.payload;
      const task = { ...state.task, title: value };
      return { ...state, task };
    }

    case EDIT_BODY: {
      const { value } = action.payload;
      const task = { ...state.task, body: { content: value, contentType: 'text' } };
      return { ...state, task };
    }

    case EDIT_TASKLIST: {
      const { value } = action.payload;
      return { ...state, selectedTasklist: value };
    }

    case EDIT_REMINDER_DATE: {
      const { value } = action.payload;
      const task = { ...state.task, reminderDateTime: value };
      return { ...state, task };
    }

    case EDIT_BOOKMARKS: {
      const { value } = action.payload;
      const task = { ...state.task, key: value };
      return { ...state, task };
    }

    case EDIT_IMPORTANCE: {
      const { value } = action.payload;
      const task = { ...state.task, importance: value };
      return { ...state, task };
    }

    case RESET_TASK: {
      return { ...state, newTask: defaultTask() };
    }

    case CREATE_TASK_START: {
      return { ...state, taskCreating: true };
    }

    case CREATE_TASK_SUCCESS: {
      return {
        ...state,
        task: defaultTask(),
        taskCreating: false,
      };
    }

    case CREATE_TASK_ERROR: {
      return {
        ...state,
        taskCreating: false,
        disableNewTaskEdit: false,
      };
    }

    case FETCH_TASKLIST_LIST_START: {
      return { ...state, tasklistListLoading: true };
    }

    case FETCH_TASKLIST_LIST_SUCCESS: {
      const { tasklistList } = action.payload;
      const selectedTasklist = tasklistList[0] || null;
      return {
        ...state, tasklistListLoading: false, tasklistList, selectedTasklist,
      };
    }

    case FETCH_TASKLIST_LIST_ERROR: {
      return { ...state, tasklistListLoading: false };
    }

    default:
      return state;
  }
}

export default popup;
