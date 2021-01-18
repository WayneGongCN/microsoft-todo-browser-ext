import { EDIT_ENABLE_BG_UPDATE, EDIT_ENABLE_BG_UPDATE_INTERVAL } from '../constants/ConfigTypes';

const initialState = {
  enableBackgroundUpdate: true,
  backgroundUpdateInterval: 60 * 1000,
};

function config(state = initialState, action) {
  switch (action.type) {
    case EDIT_ENABLE_BG_UPDATE: {
      return { ...state.todo, enableBackgroundUpdate: action.payload };
    }

    case EDIT_ENABLE_BG_UPDATE_INTERVAL: {
      return { ...state, backgroundUpdateInterval: action.payload };
    }

    default:
      return state;
  }
}

export default config;
