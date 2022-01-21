import { store, persistor } from '../../redux';
import authSlice, { asyncChunk as authSliceAsyncChunk } from '../../redux/auth';
import popupSlice from '../../redux/popup';
import taskSlice, { asyncChunk as taskSlickAsyncChunk } from '../../redux/task';
import tasklistSlice, { asyncChunk as tasklistAsyncChunk } from '../../redux/tasklist';
import optionsSlice from '../../redux/options';
import Notify from '../../helpers/notification';
import { Page } from '../../constants/enums';
import { logout } from '../../helpers/msal';
import { initSentry } from '../../helpers/report';

initSentry(Page.BACKGROUND);

const backgroundContext = {
  Notify,
  store,
  persistor,
  authSlice: authSlice as typeof authSlice & typeof authSliceAsyncChunk,
  taskSlice: taskSlice as typeof taskSlice & typeof taskSlickAsyncChunk,
  tasklistSlice: tasklistSlice as typeof tasklistSlice & typeof tasklistAsyncChunk,
  popupSlice: popupSlice,
  optionsSlice: optionsSlice,
  logout,
};
window.backgroundContext = backgroundContext;
