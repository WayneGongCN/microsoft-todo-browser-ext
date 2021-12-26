import '../helpers/report'
import { store } from "../redux";
import authSlice, { asyncChunk as authSliceAsyncChunk } from "../redux/auth";
import popupSlice from "../redux/popup";
import taskSlice, { asyncChunk as taskSlickAsyncChunk } from "../redux/task";
import tasklistSlice, { asyncChunk as tasklistAsyncChunk } from "../redux/tasklist";
import Notify from "../helpers/notification";

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