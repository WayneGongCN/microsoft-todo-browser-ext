import getStore from '../reducers';
import {
  getActiveTab, sendMessageToActiveTab, showNotify,
} from '../helpers';
import { createTask } from '../actions/app';
import { fetchTasklists } from '../actions/tasklist';


export const QUICK_ADD_MENU_ITEM = {
  id: 'QUICK_ADD',
  title: 'Quick add task',
  contexts: ['page', 'selection', 'link', 'image'],
};


export const quickCreateTask = (taskMeta) => {
  const { store } = getStore(true);
  if (!store) return Promise.reject();

  return fetchTasklists()(store.dispatch)
    .then((tasklistList) => tasklistList[0]?.id)
    .then((tasklistId) => tasklistId && createTask(tasklistId, taskMeta, true)(store.dispatch, store.getState));
};


export const handleQuickAddMenuItemEvent = (info) => {
  if (info.menuItemId !== QUICK_ADD_MENU_ITEM.id) return Promise.resolve(null);

  return getActiveTab()
    .then((activeTab) => {
      const describe = info.selectionText;
      let title = info.selectionText || activeTab.title;
      title = title.length > 130 ? `${title.slice(0, 130)}...` : title;

      const taskMeta = {
        title,
        describe,
        contentType: 'text',
        timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
        importance: false,
        bookmarked: true,
      };

      sendMessageToActiveTab({ type: 'CURSOR_LOADING' });
      return quickCreateTask(taskMeta)
        .finally(() => {
          sendMessageToActiveTab({ type: 'CURSOR_RESET' });
        });
    })
    .catch((e) => showNotify('Error', e.message));
};
