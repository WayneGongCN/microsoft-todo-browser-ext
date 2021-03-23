import getStore from '../reducers';
import { makeBookmarkInfo, sendMessageToActiveTab } from '../helpers';
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
    .then((tasklistId) => tasklistId && createTask(tasklistId, taskMeta)(store.dispatch, store.getState));
};


export const handleQuickAddMenuItemEvent = (info) => {
  if (info.menuItemId !== QUICK_ADD_MENU_ITEM.id) return Promise.resolve(null);

  const taskMeta = {
    title: info.selectionText,
    describe: '',
    contentType: 'text',
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    importance: false,
    bookmarked: true,
    bookmarkInfo: makeBookmarkInfo(),
  };

  sendMessageToActiveTab({ type: 'CURSOR_LOADING' });
  return quickCreateTask(taskMeta)
    .finally(() => {
      sendMessageToActiveTab({ type: 'CURSOR_RESET' });
    });
};
