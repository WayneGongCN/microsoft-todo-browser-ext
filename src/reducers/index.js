import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import popup from './popup';
import account from './account';
import { isDev } from '../helpers';

const reducers = combineReducers({ account, popup });
const middlewares = [
  thunk,
  isDev && logger,
];

let storeInstance = null;
export default function getStore(flag) {
  if (flag) storeInstance = createStore(reducers, applyMiddleware(...middlewares));
  return storeInstance;
}
