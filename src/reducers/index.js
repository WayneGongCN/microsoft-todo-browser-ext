import { applyMiddleware, createStore, combineReducers } from 'redux';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import app from './app';
import config from './config';
import tasklist from './tasklist';
import popup from './popup';
import { isDev } from '../helpers';

const middlewares = [
  thunk,
  isDev && logger,
].filter(Boolean);

const reducers = combineReducers({
  app,
  config,
  tasklist,
  popup,
});

let storeInstance = null;
export default function getStore(flag) {
  if (flag) {
    const store = createStore(reducers, applyMiddleware(...middlewares));
    const persist = persistStore(store);
    storeInstance = { store, persist };
  }
  return storeInstance;
}
