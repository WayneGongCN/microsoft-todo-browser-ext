import { makeBookmarkInfo } from '../helpers/index';
import { createTask, fetchTasklists } from '../actions/app';
import getStore from '../reducers/index';


export const QUICK_ADD_MENU_ITEM = {
  id: 'QUICK_ADD',
  title: 'Quick add task',
  contexts: ['page', 'selection', 'link', 'image'],
};


export const quickCreateTask = (task: any) => {
  const { store } = getStore(true);
  if (!store) return Promise.reject();

  return fetchTasklists()(store.dispatch)
    .then((tasklistList) => tasklistList[0]?.id)
    .then((tasklistId) => tasklistId && createTask(tasklistId, task)(store.dispatch, store.getState));
};


export const handleQuickAddMenuItemEvent = (info: chrome.contextMenus.OnClickData) => {
  if (info.menuItemId !== QUICK_ADD_MENU_ITEM.id) return Promise.resolve(null);

  const task = {
    title: info.selectionText,
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    bookmarked: true,
    bookmarkInfo: makeBookmarkInfo(),
  };

  return quickCreateTask(task);
};
