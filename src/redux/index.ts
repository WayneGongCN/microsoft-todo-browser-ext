import { isDev } from "../helpers";
import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./app";
import logger from "redux-logger";


export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  devTools: isDev,

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .prepend(logger)
  }
});


export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
