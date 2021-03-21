import { applyMiddleware, createStore, combineReducers } from 'redux/index';
import app from './app';
import logger from 'redux-logger';
import { isDev } from '../helpers/index';
import thunk from 'redux-thunk/index';
import persistStore from 'redux-persist/es/persistStore';


const middlewares = [
  thunk,
  isDev && logger,
].filter(Boolean);


let persistStoreInstance: {persist: any, store: any} = null;
const reducers = combineReducers({ app });


export default function getStore(flag: Boolean = false) {
  if (flag) {
    const store = createStore(reducers, applyMiddleware(...middlewares));
    const persist = persistStore(store);
    persistStoreInstance = { store, persist };
  }
  return persistStoreInstance;
}
