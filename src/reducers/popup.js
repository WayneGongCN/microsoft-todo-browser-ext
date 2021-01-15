import { combineReducers } from 'redux';
import {
  ADD_TODO,
} from '../constants/PopupTypes';

const initialState = {
  nums: 0,
};

function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      const nums = state.nums + 1;
      return { nums };
    }

    default:
      return state;
  }
}

const rootReducer = combineReducers({ todos });

export default rootReducer;
