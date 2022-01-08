import { IContentMessage } from '../../types';
import { NotifyType } from '../constants/enums';
import { logger } from './logger';

// TODO: fix type
// eslint-disable-next-line
export const bindAsyncActions = (slice: any, asyncActioMap: Record<string, Function>) => {
  Object.keys(asyncActioMap).forEach((key) => {
    slice[key] = asyncActioMap[key];
  });
};

export const openMicrosoftTodo = (type?: NotifyType, id?: string) =>
  new Promise((resolve, reject) => {
    const prefix = 'https://to-do.live.com';

    let url = '';
    if (type === NotifyType.TASK) {
      url = `${prefix}/tasks/id/${id}/details`;
    } else if (type === NotifyType.TASKLIST) {
      url = `${prefix}/tasks/${id}`;
    } else {
      url = `${prefix}/tasks/inbox`;
    }

    chrome.tabs.create({ active: true, url }, (tab) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
      return resolve(tab);
    });
  });

export const getActiveTab = (): Promise<chrome.tabs.Tab> =>
  new Promise((resolve, reject) => {
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

export const sendMessageToActiveTab = (msg: IContentMessage): Promise<chrome.tabs.Tab> => {
  return getActiveTab().then((tab) => {
    chrome.tabs.sendMessage(tab.id, msg, (response) => {
      logger.log('response: ', response);
    });
    return tab;
  });
};

export const getI18nText = (msgName: string): string => {
  return chrome.i18n.getMessage(msgName);
};
