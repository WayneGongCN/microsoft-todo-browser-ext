import { configureStore } from '@reduxjs/toolkit';
import authSlice from './auth';
import { createLogger } from 'redux-logger';
import taskSlice from './task';
import tasklistSlice from './tasklist';
import popupSlice from './popup';
import optionsSlice from './options';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { onPresistReady } from '../helpers/persist';
import confSlice from './conf';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createChromeStorage from 'redux-persist-chrome-storage'

const storage = createChromeStorage(chrome, 'sync');
const rootReducer = {
  conf: confSlice.reducer,
  task: taskSlice.reducer,
  tasklist: tasklistSlice.reducer,
  popup: persistReducer({ key: 'popup', storage }, popupSlice.reducer),
  auth: persistReducer({ key: 'auth', storage }, authSlice.reducer),
  options: persistReducer({ key: 'options', storage }, optionsSlice.reducer),
};

export const store = configureStore({
  devTools: true,
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(createLogger({ collapsed: true, duration: true }));
  },
});

export const persistor = persistStore(store, undefined, onPresistReady);

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
