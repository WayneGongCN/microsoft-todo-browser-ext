import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import popup from './popup';
import account from './account';

const reducers = combineReducers({ account, popup });
const store = createStore(reducers, applyMiddleware(thunk, logger));

export default store;
