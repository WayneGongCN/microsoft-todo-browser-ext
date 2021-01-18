import { CHANGE_ENABLE_BG_UPDATE, CHANGE_ENABLE_BG_UPDATE_INTERVAL } from "../constants/ConfigTypes";

// import Todo from '../models/Todo';
const initialState = {
  enableBackgroundUpdate: true,
  backgroundUpdateInterval: 60 * 1000,
};

function config(state = initialState, action) {
  switch (action.type) {
    case CHANGE_ENABLE_BG_UPDATE: {
      return { ...state.todo, enableBackgroundUpdate: action.payload };
    }

    case CHANGE_ENABLE_BG_UPDATE_INTERVAL: {
      return { ...state, backgroundUpdateInterval: action.payload };
    }

    default:
      return state;
  }
}

export default config;
