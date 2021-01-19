import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import popup from './popup';
import account from './account';

const reducers = combineReducers({ account, popup });
let storeInstance = null;

export default function getStore(flag) {
  if (flag) storeInstance = createStore(reducers, applyMiddleware(thunk, logger));
  return storeInstance;
}
