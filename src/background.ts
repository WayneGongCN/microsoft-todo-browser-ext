import { store } from "./redux";
import { appSlice, asyncChunk as appSliceAsyncChunk } from "./redux/app";
import taskApi from './redux/api/task'

export const backgroundContext = {
  store,
  appSlice: appSlice as typeof appSlice & typeof appSliceAsyncChunk,
  taskApi
};

// @ts-ignore
window.backgroundContext = backgroundContext;
console.log("process.env.NODE_ENV: ", backgroundContext);
