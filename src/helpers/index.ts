import { IContentMessage } from '../../types';
import { ErrorCode, NotifyType } from '../constants/enums';
import AppError from './error';

// TODO: fix type
// eslint-disable-next-line
export const bindAsyncActions = (slice: any, asyncActioMap: Record<string, Function>) => {
  Object.keys(asyncActioMap).forEach((key) => {
    slice[key] = asyncActioMap[key];
  });
};

export const openUrl = (options: chrome.tabs.CreateProperties) =>
  new Promise((resolve, reject) => {
    chrome.tabs.create(options, (tab) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) return reject(new AppError({ code: ErrorCode.CREATE_TAB, message: lastError.message }));
      return resolve(tab);
    });
  });

export const openMicrosoftTodo = (type?: NotifyType, id?: string) => {
  const prefix = 'https://to-do.live.com';

  let url = '';
  if (type === NotifyType.TASK) {
    url = `${prefix}/tasks/id/${id}/details`;
  } else if (type === NotifyType.TASKLIST) {
    url = `${prefix}/tasks/${id}`;
  } else {
    url = `${prefix}/tasks/inbox`;
  }

  return openUrl({ url });
};

export const getActiveTab = (): Promise<chrome.tabs.Tab> =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) return reject(new AppError({ code: ErrorCode.QUERY_TAB, message: lastError.message }));
      else if (tabs && tabs.length > 0) {
        const firstActiveTab = tabs[0];
        return resolve(firstActiveTab);
      } else {
        reject(new AppError({ code: ErrorCode.NOT_FOUND_TAB }));
      }
    });
  });

export const sendMessageToActiveTab = (msg: IContentMessage): Promise<chrome.tabs.Tab> => {
  return getActiveTab().then((tab) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, msg, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) return reject(new AppError({ code: ErrorCode.SEND_MESSAGE, message: lastError.message }));
        return resolve(response);
      });
    });
  });
};

export const getI18nText = (name: string): string => chrome.i18n.getMessage(name);
