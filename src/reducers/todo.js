// import Todo from '../models/Todo';
import {
  ADD_NEW_TASK_LIST,
  CREATE_NEW_TASK_ERROR,
  CREATE_NEW_TASK_START,
  CREATE_NEW_TASK_SUCCESS,
  DELETE_TASK_ERROR,
  DELETE_TASK_START,
  DELETE_TASK_SUCCESS,
  EDIT_NEW_TASK,
  EDIT_TASK,
  RESET_NEW_TASK,
  UPDATE_TASK_ERROR,
  UPDATE_TASK_START,
  UPDATE_TASK_SUCCESS,
} from '../constants/TodoTypes';

const defaultTasklist = () => ({ displayName: '' });
const defaultTask = () => ({
  body: {
    content: '',
    contentType: 'text',
  },
  completedDateTime: null,
  dueDateTime: null,
  importance: 'normal',
  isReminderOn: false,
  status: 'notStarted',
  title: '',
});

const initialState = {
  taskLoading: false,
  taskCreating: false,
  taskDeleting: [],
  taskUpdating: [],

  tasklistListLoading: false,
  taskListCreating: false,
  taskListDeleting: [],
  taskListUpdating: [],

  disableNewTaskEdit: false,
  disableNewTasklistEdit: false,

  // newTasklist: defaultTasklist(),
  newTask: defaultTask(),

  tasklistList: [],
  taskList: [],

  currentTasklist: null,
  currentTask: null,
};

function todo(state = initialState, action) {
  switch (action.type) {
    // Task
    case EDIT_NEW_TASK: {
      const { key, value } = action.payload;
      const newTask = { ...state.newTask, [key]: value };
      return { ...state, newTask };
    }

    case RESET_NEW_TASK: {
      return { ...state, newTask: defaultTask() };
    }

    case CREATE_NEW_TASK_START: {
      return { ...state, taskCreating: true, disableNewTaskEdit: true };
    }

    case CREATE_NEW_TASK_SUCCESS: {
      const taskList = [].concat(...state.taskList, action.payload.task);
      return {
        ...state,
        taskList,
        newTask: defaultTask(),
        taskCreating: true,
        disableNewTaskEdit: false,
      };
    }

    case CREATE_NEW_TASK_ERROR: {
      return {
        ...state,
        taskCreating: false,
        disableNewTaskEdit: false,
      };
    }

    case DELETE_TASK_START: {
      const { taskId } = action.payload;
      const taskDeleting = [...state.taskDeleting, taskId];
      return { ...state, taskDeleting };
    }
    case DELETE_TASK_SUCCESS: {
      const { taskId } = action.payload;
      const taskDeleting = state.taskDeleting.filter((x) => x !== taskId);
      const taskList = state.taskList.filter((x) => x.id !== taskId);
      return { ...state, taskDeleting, taskList };
    }
    case DELETE_TASK_ERROR: {
      const { taskId } = action.payload;
      const taskDeleting = state.taskDeleting.filter((x) => x !== taskId);
      return { ...state, taskDeleting };
    }

    case EDIT_TASK: {
      const { taskId, key, value } = action.payload;
      let task = state.taskList.find((x) => x.id === taskId);
      task = { ...task, [key]: value };
      const taskList = state.taskList.map((x) => (x.id === taskId ? task : x));
      return { ...state, taskList };
    }

    case UPDATE_TASK_START: {
      const { taskId } = action.payload;
      const taskUpdating = state.taskUpdating.concat(taskId);
      return { ...state, taskUpdating };
    }

    case UPDATE_TASK_SUCCESS: {
      const { taskId, task } = action.payload;
      const taskUpdating = state.taskUpdating.filter((x) => x.id !== taskId);
      const taskList = state.taskList.concat(task);
      return { ...state, taskUpdating, taskList };
    }

    case UPDATE_TASK_ERROR: {
      const { taskId } = action.payload;
      const taskUpdating = state.taskUpdating.filter((x) => x.id !== taskId);
      return { ...state, taskUpdating };
    }

    // Tasklist
    case ADD_NEW_TASK_LIST: {
      const newTasklist = defaultTasklist();
      newTasklist.enableEdit = true;
      const tasklistList = [...state.tasklistList, defaultTasklist];
      return { ...state, tasklistList };
    }

    default:
      return state;
  }
}

export default todo;
