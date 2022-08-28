import { store } from '../redux';
import { createTask } from '../redux/task';
import { fetchTasklist } from '../redux/tasklist';
import { LNAG_UNTITLE } from '../constants/lang';
import { sendMessageToActiveTab } from '.';
import { EContentMessage, EQuickTaskTitle, ErrorCode } from '../constants/enums';
import { QUICK_ADD_MENU_ITEMS } from '../constants';
import optionsSlice from '../redux/options';
import AppError from './error';

let eventInit = false;
const initEvent = () => {
  if (eventInit) return;
  eventInit = true;

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const { selectionText } = info;
    const { title: TabTitle } = tab;
    const state = store.getState();
    const { options } = state;
    const { quickTaskTitleType } = options.form;

    let taskTitle = quickTaskTitleType === EQuickTaskTitle.ACTIVE_TAB ? TabTitle : selectionText;
    taskTitle = taskTitle || LNAG_UNTITLE;
    taskTitle = taskTitle.length > 130 ? taskTitle.slice(0, 130) + ' ...' : taskTitle;

    let { quickAddTaskTasklistId } = options.form;
    if (!quickAddTaskTasklistId) {
      await store.dispatch(fetchTasklist());
      quickAddTaskTasklistId = store.getState().tasklist.lists[0]?.id;
      store.dispatch(optionsSlice.actions.updateForm({ quickAddTaskTasklistId }));
    }

    sendMessageToActiveTab({ type: EContentMessage.CURSOR_LOADING });
    store
      .dispatch(
        createTask({
          title: taskTitle,
          describe: selectionText || '',
          bookmark: true,
          tasklistId: quickAddTaskTasklistId,
        })
      )
      .finally(() => sendMessageToActiveTab({ type: EContentMessage.CURSOR_RESET }));
  });
};

const createMenu = () => {
  QUICK_ADD_MENU_ITEMS.forEach((item) => {
    chrome.contextMenus.create(item, () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) throw new AppError({ code: ErrorCode.CREATE_MENU, message: lastError.message });
    });
  });
};

export const initQuickAdd = () => {
  return
  // const state = store.getState();
  // const { options } = state;
  // const { enableQuickAdd } = options.form;

  // chrome.contextMenus.removeAll(() => {
  //   if (!enableQuickAdd) return;

  //   createMenu();
  //   initEvent();
  // });
};
