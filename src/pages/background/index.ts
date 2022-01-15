import { store } from '../../redux';
import authSlice, { acquireTokenSilent, asyncChunk as authSliceAsyncChunk } from '../../redux/auth';
import popupSlice from '../../redux/popup';
import taskSlice, { asyncChunk as taskSlickAsyncChunk } from '../../redux/task';
import tasklistSlice, { asyncChunk as tasklistAsyncChunk } from '../../redux/tasklist';
import Notify from '../../helpers/notification';
import { Page } from '../../constants/enums';
import { logout } from '../../helpers/msal';
import optionsSlice from '../../redux/options';
import { initSentry } from '../../helpers/report';
import initQuickAdd from '../../helpers/quickAdd';

initSentry(Page.BACKGROUND);
initQuickAdd();

const backgroundContext = {
  Notify,
  store,
  authSlice: authSlice as typeof authSlice & typeof authSliceAsyncChunk,
  taskSlice: taskSlice as typeof taskSlice & typeof taskSlickAsyncChunk,
  tasklistSlice: tasklistSlice as typeof tasklistSlice & typeof tasklistAsyncChunk,
  popupSlice: popupSlice,
  optionsSlice: optionsSlice,
  logout,
};

window.backgroundContext = backgroundContext;

store.dispatch(acquireTokenSilent());
