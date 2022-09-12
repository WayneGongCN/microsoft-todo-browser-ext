import { configureStore } from '@reduxjs/toolkit';
import { persistAuthReducer } from './auth';
import { createLogger } from 'redux-logger';
import taskSlice from './task';
<<<<<<< Updated upstream
import tasklistSlice from './tasklist';
import popupSlice from './popup';
import optionsSlice from './options';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { onPresistReady } from '../helpers/persist';
import confSlice from './conf';
=======
import { persistTasklistReducer } from './tasklist';
import { persistPopupReducer } from './popup';
import { persistOptionsReducer } from './options';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { persistConfReducer } from './conf';
import { storage } from '../helpers';
import { ENABLE_DEBUG, EXT_VER_NUM } from '../constants';
>>>>>>> Stashed changes



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



export const persistor = persistStore(store, undefined, onPresistReady);
export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
