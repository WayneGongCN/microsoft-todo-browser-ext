import {
  FETCH_OAUTH_TOKEN_ERROR, FETCH_OAUTH_TOKEN_START, FETCH_OAUTH_TOKEN_SUCCESS,
  LOG_OUT_ERROR, LOG_OUT_START, LOG_OUT_SUCCESS,
} from '../constants/AccountTypes';

const initialState = {
  waiting: false,
  token: null,
};

function account(state = initialState, action) {
  switch (action.type) {
    case LOG_OUT_START: {
      return { ...state, waiting: true };
    }
    case LOG_OUT_SUCCESS: {
      return { ...state, waiting: false, token: null };
    }
    case LOG_OUT_ERROR: {
      return { ...state, waiting: false, token: null };
    }

    case FETCH_OAUTH_TOKEN_START: {
      return { ...state, waiting: true };
    }
    case FETCH_OAUTH_TOKEN_SUCCESS: {
      return { ...state, waiting: false, token: action.payload };
    }
    case FETCH_OAUTH_TOKEN_ERROR: {
      return { ...state, waiting: false, token: null };
    }

    default:
      return state;
  }
}

export default account;
