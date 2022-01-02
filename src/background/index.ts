import '../helpers/quickAdd'
import { store } from "../redux";
import authSlice, { asyncChunk as authSliceAsyncChunk, authentication } from "../redux/auth";
import popupSlice from "../redux/popup";
import taskSlice, { asyncChunk as taskSlickAsyncChunk } from "../redux/task";
import tasklistSlice, { asyncChunk as tasklistAsyncChunk } from "../redux/tasklist";
import Notify from "../helpers/notification";
import report from '../helpers/report'
import { Page } from "../constants/enums";

report(Page.BACKGROUND)

export const backgroundContext = {
  Notify,
  store,
  authSlice: authSlice as typeof authSlice & typeof authSliceAsyncChunk,
  taskSlice: taskSlice as typeof taskSlice & typeof taskSlickAsyncChunk,
  tasklistSlice: tasklistSlice as typeof tasklistSlice & typeof tasklistAsyncChunk,
  popupSlice: popupSlice as typeof popupSlice,
};
// @ts-ignore
window.backgroundContext = backgroundContext;

// store.dispatch(authentication()).then(console.log)