import Notify from './notification';

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const openMicrosoftTodo = (target) => new Promise((resolve, reject) => {
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

export const getActiveTabInfo = () => new Promise((resolve, reject) => {
  chrome.tabs.query({ active: true }, (tab) => {
    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
    const curTab = tab[0] || '';
    return resolve(curTab && `\n\n---\n${curTab.title}\n${curTab.url}`);
  });
});

export const showNavigateNotify = (target, title = 'Notify', message = 'Open Microsoft To-Do.') => {
  const notify = new Notify(title, message);
  notify.onClick(() => {
    notify.clear();
    openMicrosoftTodo(target);
  });
  notify.create();
  return notify;
};
