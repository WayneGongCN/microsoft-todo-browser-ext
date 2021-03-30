import { applyMiddleware, createStore, combineReducers, AnyAction, Dispatch, Middleware } from 'redux';
import app from './app';
import logger from 'redux-logger';
import { isDev } from '../helpers';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import persistStore from 'redux-persist/es/persistStore';
import { configureStore, createAction, EnhancedStore, MiddlewareArray } from '@reduxjs/toolkit';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { PERSIST, REGISTER, REHYDRATE } from 'redux-persist/es/constants';


let storeInstance: EnhancedStore<{ app: IAppStatus & PersistPartial; }, AnyAction, MiddlewareArray<ThunkMiddleware<{ app: IAppStatus & PersistPartial; }, AnyAction, null> | ThunkMiddleware<{ app: IAppStatus & PersistPartial; }, AnyAction, undefined> | Middleware<{}, { app: IAppStatus & PersistPartial; }, Dispatch<AnyAction>>>> = null
let persistStoreInstance = null;


export const getStore = (restructure = false) => {
  if (storeInstance === null || restructure) {
    storeInstance = configureStore({
      reducer: { app },
      devTools: isDev,
      middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
          // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
          ignoredActions: [REHYDRATE, REGISTER, PERSIST]
        }
      }),
    })

    persistStoreInstance = persistStore(storeInstance);
  }
  return storeInstance
}
