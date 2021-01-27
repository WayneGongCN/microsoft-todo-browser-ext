import {
  FETCH_OAUTH_TOKEN_ERROR, FETCH_OAUTH_TOKEN_START, FETCH_OAUTH_TOKEN_SUCCESS,
  LOG_OUT_ERROR, LOG_OUT_START, LOG_OUT_SUCCESS, GET_ACCOUNTS,
} from '../constants/AccountTypes';

const defaultState = () => ({
  loggingIn: false,
  account: null,
  scopes: ['User.Read', 'Tasks.ReadWrite'],
  token: null,
});

const initialState = defaultState();

function accountReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ACCOUNTS: {
      const { account } = action.payload;
      return { ...state, account };
    }

    // logout
    case LOG_OUT_START: {
      return defaultState();
    }
    case LOG_OUT_SUCCESS: {
      return defaultState();
    }
    case LOG_OUT_ERROR: {
      return defaultState();
    }

    // fetch token
    case FETCH_OAUTH_TOKEN_START: {
      return { ...state, loggingIn: true };
    }
    case FETCH_OAUTH_TOKEN_SUCCESS: {
      const { token } = action.payload;
      return {
        ...state, loggingIn: false, token, account: token.account,
      };
    }
    case FETCH_OAUTH_TOKEN_ERROR: {
      return defaultState();
    }

    default:
      return state;
  }
}

export default accountReducer;
