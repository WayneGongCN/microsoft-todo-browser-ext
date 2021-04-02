import { combineReducers } from 'redux';
import { isDev } from '../helpers';
import { configureStore } from '@reduxjs/toolkit';
import { PERSIST, REGISTER, REHYDRATE } from 'redux-persist';
import accountReducer from './account'
import persistStore from 'redux-persist/lib/persistStore';


const rootReducer = combineReducers({
  account: accountReducer
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: isDev,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: {
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      ignoredActions: [REHYDRATE, REGISTER, PERSIST]
    }
  }),
})

export let persistStoreInstance = persistStore(store);;


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
