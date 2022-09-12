import { DEFAULT_LANG, EXT_VER_NUM, LANG } from '../constants';
import { ErrorCode, NotifyType } from '../constants/enums';
import AppError from './error';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createChromeStorage from 'redux-persist-chrome-storage'


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




/**
 * 
 */
export interface ExtMessage {
  type: MessageType;
  payload?: any;
}
export enum MessageType {
  CURSOR_LOADING,
  CURSOR_RESET,
  GET_SELECTION_TEXT
}
export const sendMessageToActiveTab = <T>(msg: ExtMessage): Promise<T> => {
  return getActiveTab().then((tab) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, msg, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) return reject(new AppError({ code: ErrorCode.SEND_MESSAGE, message: lastError.message }));
        if (response.error) return reject(response.error)
        else resolve(response.payload)
      });
    });
  });
};


export const getI18nConf = (conf: string | Record<string, string>): string => {
  if (typeof conf === 'string') return conf
  else return conf[LANG] || conf[DEFAULT_LANG] || ''
}


/**
 * Redux
 */
export const storage = createChromeStorage(chrome, 'sync');
export const getPersistConf = (options: any) => ({ storage, version: EXT_VER_NUM, ...options })
