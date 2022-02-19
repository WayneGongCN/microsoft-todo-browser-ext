import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth';
import { createLogger } from 'redux-logger';
import taskSlice from './task';
import tasklistSlice from './tasklist';
import popupSlice from './popup';
import { IS_DEV, IS_PROD } from '../constants';
import optionsSlice from './options';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { onPresistReady } from '../helpers/persist';
import { loggerMiddleWare } from '../helpers/logger';

const rootReducer = {
  task: taskSlice.reducer,
  tasklist: tasklistSlice.reducer,
  popup: persistReducer({ key: 'popup', storage }, popupSlice.reducer),
  auth: persistReducer({ key: 'auth', storage }, authSlice.reducer),
  options: persistReducer({ key: 'options', storage }, optionsSlice.reducer),
};

export const store = configureStore({
  devTools: IS_DEV,
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([IS_DEV && createLogger({ collapsed: true, duration: true }), IS_PROD && loggerMiddleWare].filter(Boolean));
  },
});

export const persistor = persistStore(store, undefined, onPresistReady);

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
