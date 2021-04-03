import { Task, Tasklist } from '../models/Task';
import Notify from './notification';


export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';


export const openMicrosoftTodo = (target?: Task | Tasklist) => new Promise((resolve, reject) => {
  const prefix = 'https://to-do.live.com';

  let url = '';
  // eslint-disable-next-line no-undef
  if (target instanceof Task) {
    url = `${prefix}/tasks/id/${target.id}/details`;
    // eslint-disable-next-line no-undef
  } else if (target instanceof Tasklist) {
    url = `${prefix}/tasks/${target.id}`;
  } else {
    url = `${prefix}/tasks/inbox`;
  }

  chrome.tabs.create({ active: true, url }, (tab) => {
    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
    return resolve(tab);
  });
});


export const getActiveTab = () => new Promise((resolve, reject) => {
  chrome.tabs.query({ active: true }, (tabs) => {
    if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
    else if (tabs && tabs.length > 0) {
      const firstActiveTab = tabs[0];
      resolve(firstActiveTab);
    } else {
      reject(new Error('Not found active tab.'));
    }
  });
});


export const makeBookmarkInfo = (tab, quickAdd = false) => {
  const bookmarkInfo = `\n${tab.title}\n\n${tab.url}\n`;
  const quickAddInfo = "\nCreated by 'Quick add task'\n";
  return `\n\n---${quickAdd ? quickAddInfo : ''}${bookmarkInfo}`;
};


export const sendMessageToActiveTab = (msg) => getActiveTab().then((tab) => chrome.tabs.sendMessage(tab.id, msg));


export const showNotify = (title = 'Notify', message) => {
  const notify = new Notify(title, message);
  notify.create();
  return notify;
};


export const showTaskNotify = (task, title, message = 'Open Microsoft To-Do.') => {
  const notify = showNotify(title, message);
  notify.onClick(() => {
    notify.clear();
    openMicrosoftTodo(task);
  });
  return notify;
};

