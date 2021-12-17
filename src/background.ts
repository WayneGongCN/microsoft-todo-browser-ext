import { store } from "./redux";
import { appSlice, asyncChunk as appSliceAsyncChunk } from "./redux/app";

export const backgroundContext = {
  store,
  appSlice: appSlice as typeof appSlice & typeof appSliceAsyncChunk
};

// @ts-ignore
window.backgroundContext = backgroundContext;
console.log("process.env.NODE_ENV: ", backgroundContext);
