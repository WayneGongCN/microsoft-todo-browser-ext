import {
  CREATE_TASK_ERROR, CREATE_TASK_START, CREATE_TASK_SUCCESS, FETCH_OAUTH_TOKEN_ERROR, FETCH_OAUTH_TOKEN_START, FETCH_OAUTH_TOKEN_SUCCESS, FETCH_TASKLIST_LIST_ERROR, FETCH_TASKLIST_LIST_START, FETCH_TASKLIST_LIST_SUCCESS, GET_ACCOUNTS, LOG_OUT_ERROR, LOG_OUT_START, LOG_OUT_SUCCESS,
} from '../constants/appTypes';

const initialState = {
  // account
  account: null,
  token: null,
  scopes: ['User.Read', 'Tasks.ReadWrite'],
  loggingIn: false,

  // tasklist
  tasklistList: [],
  fetchingTasklistList: false,

  // task
  taskCreating: false,
};

function appReducer(state = initialState, action) {
  switch (action.type) {
    // Account
    case GET_ACCOUNTS: {
      const account = action.payload;
      return { ...state, account };
    }
    case FETCH_OAUTH_TOKEN_START: {
      return { ...state, loggingIn: true };
    }
    case FETCH_OAUTH_TOKEN_SUCCESS: {
      const token = action.payload;
      return {
        ...state, token, loggingIn: false,
      };
    }
    case LOG_OUT_START:
    case LOG_OUT_ERROR:
    case LOG_OUT_SUCCESS:
    case FETCH_OAUTH_TOKEN_ERROR:
      return {
        ...state, account: null, token: null, logginIn: false,
      };

    // Tasklist
    case FETCH_TASKLIST_LIST_START: {
      return { ...state, fetchingTasklistList: true };
    }
    case FETCH_TASKLIST_LIST_SUCCESS: {
      const tasklistList = action.payload;
      return {
        ...state, tasklistList, fetchingTasklistList: false,
      };
    }
    case FETCH_TASKLIST_LIST_ERROR: {
      return { ...state, fetchingTasklistList: false };
    }

    // Task
    case CREATE_TASK_START: {
      return { ...state, taskCreating: true };
    }
    case CREATE_TASK_SUCCESS: {
      return { ...state, taskCreating: false };
    }
    case CREATE_TASK_ERROR: {
      return { ...state, taskCreating: false };
    }

    default:
      return state;
  }
}

export default appReducer;
