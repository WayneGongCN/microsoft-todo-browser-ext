
import { REPORT_ERROR, REPORT_SAMPLE_RATE } from "../constants";
import { store } from "../redux";
import authSlice, { asyncChunk as authSliceAsyncChunk } from "../redux/auth";
import popupSlice, { asyncChunk as popupSliceAsyncChunk } from "../redux/popup";
import taskSlice, { asyncChunk as taskSlickAsyncChunk } from "../redux/task";
import tasklistSlice,{  asyncChunk as tasklistAsyncChunk } from "../redux/tasklist";


export const backgroundContext = {
  store,
  authSlice: authSlice as typeof authSlice & typeof authSliceAsyncChunk,
  taskSlice: taskSlice as typeof taskSlice & typeof taskSlickAsyncChunk,
  tasklistSlice: tasklistSlice as typeof tasklistSlice & typeof tasklistAsyncChunk,
  popupSlice: popupSlice as typeof popupSlice & typeof popupSliceAsyncChunk
};
// @ts-ignore
window.backgroundContext = backgroundContext;


(async() => {
  if (!REPORT_ERROR) return 
  const Sentry = await import("@sentry/browser")
  const Integrations = await import("@sentry/tracing");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: REPORT_SAMPLE_RATE,
  });
})()