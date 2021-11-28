import { isDev } from "../helpers";
import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./app";
import logger from "redux-logger";
import taskApi from "./api/task";


export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    [taskApi.reducerPath]: taskApi.reducer
  },
  devTools: isDev,

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .prepend(logger)
      .concat(taskApi.middleware)
  }
});


export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
