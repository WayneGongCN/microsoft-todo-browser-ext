import { ETARGET } from './enums';
import { repository } from '../../package.json';
import { LNAG_QUICK_ADD_TASK } from './lang';
import { TimeZone } from '../api/createTask';


export const NODE_ENV = process.env.NODE_ENV;
export const EXT_ID = chrome.runtime.id;
export const LANG = chrome.i18n.getUILanguage();
export const DEFAULT_LANG = 'en';


export const MSAL_CLIENT_ID_MAP = {
  [ETARGET.CHROME]: process.env.CHROME_CLIENT_ID,
  [ETARGET.EDGE]: process.env.EDGE_CLIENT_ID,
  [ETARGET.FIREFOX]: process.env.FIREFOX_CLIENT_ID,
};
export const MSAL_CLIENT_ID = MSAL_CLIENT_ID_MAP[ETARGET.CHROME];
export const AUTH_SCOPES = ['profile', 'Tasks.ReadWrite'];


export const HOME_URL = 'https://ms-todo.com'
export const REPOSITORY = repository;
export const OPTIONS_PAGE_URL = `chrome-extension://${EXT_ID}/options.html`;
export const ISSUE_URL = `${REPOSITORY}/issues/new`;
export const RATE_URL = `https://chrome.google.com/webstore/detail/microsoft-to-do-browser-e/${EXT_ID}/reviews`;


export const API_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const API_TIME_OUT = 1000 * 60;


export const NOTIFICATION_ICON_URL = `chrome-extension://${EXT_ID}/icons/todo-128.png`;
export const NOTIFICATION_TYPE = 'basic';
export const TIME_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;


export const DEFAULT_FORM_POPUP = {
  title: '',
  describe: '',
  tasklistId: '',
  importance: false,
  bookmark: true,
  dateTime: '',
};
export type PopupForm = typeof DEFAULT_FORM_POPUP


export const CONTENT_MENU_ITEMS = [
  {
    id: 'QUICK_ADD',
    title: LNAG_QUICK_ADD_TASK,
    contexts: ['all'],
  },
];
