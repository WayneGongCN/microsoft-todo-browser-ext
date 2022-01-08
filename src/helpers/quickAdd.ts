import { store } from '../redux';
import { ENABLE_QUICK_ADD } from '../constants';
import { createTask } from '../redux/task';
import { getTasklist } from '../redux/tasklist';
import { LNAG_UNTITLE } from '../constants/lang';
import { sendMessageToActiveTab } from '.';
import { EContentMessage } from '../constants/enums';

export const QUICK_ADD_MENU_ITEMS = [
  {
    id: 'QUICK_ADD',
    title: 'Quick add task...',
    contexts: ['all'],
  },
];

chrome.contextMenus.removeAll(() => {
  if (!ENABLE_QUICK_ADD) return;

  QUICK_ADD_MENU_ITEMS.forEach((item) => {
    chrome.contextMenus.create(item, () => {
      if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
    });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const { selectionText } = info;
    const { title: TabTitle } = tab;

    let taskTitle = selectionText || TabTitle || LNAG_UNTITLE;
    taskTitle = taskTitle.length > 130 ? taskTitle.slice(0, 130) + ' ...' : taskTitle;

    let tasklistId = store.getState().tasklist.quickAddTasklistId;
    if (!tasklistId) {
      await store.dispatch(getTasklist());
      tasklistId = store.getState().tasklist.quickAddTasklistId;
    }

    sendMessageToActiveTab({ type: EContentMessage.CURSOR_LOADING });
    store
      .dispatch(
        createTask({
          title: taskTitle,
          describe: selectionText || '',
          bookmark: true,
          tasklistId,
        })
      )
      .finally(() => {
        sendMessageToActiveTab({ type: EContentMessage.CURSOR_RESET });
      });
  });
});
