import {
  CREATE_TASK_ERROR, CREATE_TASK_START, CREATE_TASK_SUCCESS,
  FETCH_TASKLIST_LIST_START, FETCH_TASKLIST_LIST_SUCCESS, FETCH_TASKLIST_LIST_ERROR,
  EDIT_TASK,
  RESET_TASK,
  EDIT_SELECTED_TASKLIST,
  EDIT_BOOKMARKED,
} from '../constants/PopupTypes';

const defaultTask = () => ({
  body: {
    content: '',
    contentType: 'text',
  },
  reminderDateTime: '',
  importance: 'normal',
  title: '',
});

const initialState = {
  taskCreating: false,
  tasklistListLoading: false,

  task: defaultTask(),
  tasklistList: [],
  selectedTasklistId: '',
  bookmarked: false,
};

function popup(state = initialState, action) {
  switch (action.type) {
    case EDIT_TASK: {
      const { task } = action.payload;
      return { ...state, task };
    }

    case EDIT_SELECTED_TASKLIST: {
      const { selectedTasklistId } = action.payload;
      return { ...state, selectedTasklistId };
    }

    case EDIT_BOOKMARKED: {
      const { bookmarked } = action.payload;
      return { ...state, bookmarked };
    }

    case RESET_TASK: {
      return { ...state, task: defaultTask() };
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
      const selectedTasklistId = (tasklistList[0] || {}).id || '';
      return {
        ...state, tasklistListLoading: false, tasklistList, selectedTasklistId,
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
