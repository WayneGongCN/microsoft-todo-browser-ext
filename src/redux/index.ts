import { isDev } from "../helpers";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth";
import logger, { createLogger } from "redux-logger";
import taskSlice from "./task";
import tasklistSlice from "./tasklist";
import popupSlice from "./popup";
import authMiddleware from "../helpers/authMiddleware";

export const store = configureStore({
  devTools: isDev,

  reducer: {
    auth: authSlice.reducer,
    task: taskSlice.reducer,
    tasklist: tasklistSlice.reducer,
    popup: popupSlice.reducer,
  },

  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().prepend(
      createLogger({ collapsed: true, duration: true })
    );
  },
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
