import { IPopupForm } from '../../types';
import { ETARGET, TimeZone } from './enums';
import { version, repository } from '../../package.json';
import { LNAG_QUICK_ADD_TASK } from './lang';

export const NODE_ENV = process.env.NODE_ENV;
export const EXT_ID = chrome.runtime.id;
export const LANG = chrome.i18n.getUILanguage();
export const DEFAULT_LANG = 'en';
export const IS_DEV = (window.__IS_DEV = NODE_ENV === 'development');
export const IS_PROD = (window.__IS_PROD = NODE_ENV === 'production');

export const VERSION = (window.__VERSION = version);
export const TARGET = (window.__TARGET = process.env.TARGET) as ETARGET;

export const MSAL_CLIENT_ID_MAP = {
  [ETARGET.CHROME]: process.env.CHROME_CLIENT_ID,
  [ETARGET.EDGE]: process.env.EDGE_CLIENT_ID,
  [ETARGET.FIREFOX]: process.env.FIREFOX_CLIENT_ID,
};
export const MSAL_CLIENT_ID = MSAL_CLIENT_ID_MAP[TARGET];

export const HOME_URL = 'https://mstodo-ext.waynegong.cn'
export const API_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const AUTH_SCOPES = ['profile', 'Tasks.ReadWrite'];
export const API_TIME_OUT = 1000 * 60;

export const REPOSITORY = repository;
export const OPTIONS_PAGE_URL = `chrome-extension://${EXT_ID}/options.html`;
export const ISSUE_URL = `${REPOSITORY}/issues/new`;
export const RATE_URL = `https://chrome.google.com/webstore/detail/microsoft-to-do-browser-e/${EXT_ID}/reviews`;

export const NOTIFICATION_ICON_URL = `chrome-extension://${EXT_ID}/icons/todo-128.png`;
export const NOTIFICATION_TYPE = 'basic';
export const TIME_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;

export const DEFAULT_FORM_VALS: IPopupForm = {
  title: '',
  describe: '',
  tasklistId: '',
  importance: false,
  bookmark: true,
  dateTime: '',
};


export const QUICK_ADD_MENU_ITEMS = [
  {
    id: 'QUICK_ADD',
    title: LNAG_QUICK_ADD_TASK,
    contexts: ['all'],
  },
];
