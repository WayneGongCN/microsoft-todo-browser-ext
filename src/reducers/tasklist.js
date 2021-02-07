import { REHYDRATE, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FETCH_TASKLIST_LIST_ERROR, FETCH_TASKLIST_LIST_START, FETCH_TASKLIST_LIST_SUCCESS } from '../constants/tasklist';

const initalState = {
  tasklistList: [],
  fetchingTasklistList: false,
  creatingTasklist: false,
  updateByNetwork: false,
  error: null,
};

function tasklistReducer(state = initalState, action) {
  switch (action.type) {
    // https://github.com/rt2zz/redux-persist/issues/577
    case REHYDRATE: {
      if (action.key === 'tasklist' && action.payload && Array.isArray(action.payload.tasklistList)) {
        // eslint-disable-next-line no-undef
        const tasklistList = action.payload.tasklistList.map((x) => new Tasklist(x));
        return {
          ...state, ...action.payload, tasklistList,
        };
      }
      return state;
    }

    // Tasklist
    case FETCH_TASKLIST_LIST_START: {
      return { ...state, fetchingTasklistList: true };
    }
    case FETCH_TASKLIST_LIST_SUCCESS: {
      const tasklistList = action.payload;
      return {
        ...state, tasklistList, fetchingTasklistList: false, updateByNetwork: true,
      };
    }
    case FETCH_TASKLIST_LIST_ERROR: {
      const error = action.payload;
      return { ...state, error, fetchingTasklistList: false };
    }

    default:
      return state;
  }
}
export default persistReducer({ key: 'tasklist', whitelist: ['tasklistList'], storage }, tasklistReducer);
