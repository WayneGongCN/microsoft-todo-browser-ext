import {
  GET_OAUTH_TOKEN_ERROR,
  GET_OAUTH_TOKEN_START,
  GET_OAUTH_TOKEN_SUCCESS,
  LOG_OUT_ERROR, LOG_OUT_START, LOG_OUT_SUCCESS,
} from '../constants/AccountTypes';

const initialState = {
  pending: false,
  token: null,
};

function account(state = initialState, action) {
  switch (action.type) {
    case LOG_OUT_START: {
      return { ...state, pending: true };
    }
    case LOG_OUT_SUCCESS: {
      return { ...state, pending: false, token: null };
    }
    case LOG_OUT_ERROR: {
      return { ...state, pending: false, token: null };
    }

    case GET_OAUTH_TOKEN_START: {
      return { ...state, pending: true };
    }
    case GET_OAUTH_TOKEN_SUCCESS: {
      return { ...state, pending: false, token: action.payload };
    }
    case GET_OAUTH_TOKEN_ERROR: {
      return { ...state, pending: false, token: null };
    }

    default:
      return state;
  }
}

export default account;
