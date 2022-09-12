import { configureStore } from '@reduxjs/toolkit';
import { persistAuthReducer } from './auth';
import { createLogger } from 'redux-logger';
import taskSlice from './task';
import { persistTasklistReducer } from './tasklist';
import { persistPopupReducer } from './popup';
import { persistOptionsReducer } from './options';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { persistConfReducer } from './conf';
import { ENABLE_DEBUG } from '../constants';



const rootReducer = {
  task: taskSlice.reducer,
  conf: persistConfReducer,
  options: persistOptionsReducer,
  tasklist: persistTasklistReducer,
  popup: persistPopupReducer,
  auth: persistAuthReducer,
};



export const store = configureStore({
  devTools: ENABLE_DEBUG,
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(createLogger({ collapsed: true, duration: true }));
  },
});



export const persistor = persistStore(store);
export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
