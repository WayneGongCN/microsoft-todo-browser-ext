import { store } from '../redux';
import { createTask } from '../redux/task';
import { getTasklist } from '../redux/tasklist';
import { LNAG_UNTITLE } from '../constants/lang';
import { sendMessageToActiveTab } from '.';
import { EContentMessage, EQuickTaskTitle } from '../constants/enums';
import { QUICK_ADD_MENU_ITEMS } from '../constants';
import optionsSlice from '../redux/options';

export const initQuickAdd = () => {
  const state = store.getState();
  const { options } = state;
  const { enableQuickAdd } = options.form;

  chrome.contextMenus.removeAll(() => {
    if (!enableQuickAdd) return;

    QUICK_ADD_MENU_ITEMS.forEach((item) => {
      chrome.contextMenus.create(item, () => {
        if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
      });
    });

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
        await store.dispatch(getTasklist());
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
  });
};
