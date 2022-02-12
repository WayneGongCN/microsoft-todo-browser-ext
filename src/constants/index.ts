import { IPopupForm } from '../../types';
import { EQuickTaskTitle, TimeZone } from './enums';
import { version } from '../../package.json';
import { LNAG_QUICK_ADD_TASK } from './lang';

export const EXT_ID = chrome.runtime.id;

export const IS_DEV = (window.__IS_DEV = process.env.NODE_ENV === 'development');
export const IS_PROD = (window.__IS_PROD = process.env.NODE_ENV === 'production');
export const IS_BG_PAGE = location.href.includes('background');
export const IS_POPUP_PAGE = location.href.includes('popup');
export const IS_OPTION_PAGE = location.href.includes('option');

export const VERSION = (window.__VERSION = version);
export const BUILD_TARGET = (window.__BUILD_TARGET = process.env.BUILD_TARGET);

export const API_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const AUTH_SCOPES = ['profile', 'Tasks.ReadWrite'];
export const API_TIME_OUT = 1000 * 60;

export const EXT_URL = `https://chrome.google.com/webstore/detail/microsoft-to-do-browser-e/${EXT_ID}`;
export const OPTIONS_PAGE_URL = `chrome-extension://${EXT_ID}/options.html`;
export const REPO_URL = 'https://github.com/WayneGongCN/microsoft-todo-browser-ext';
export const ISSUE_URL = `${REPO_URL}/issues/new`;
export const RATE_URL = `https://chrome.google.com/webstore/detail/microsoft-to-do-browser-e/${EXT_ID}/reviews`;

export const REPORT = !IS_DEV;
export const REPORT_SAMPLE_RATE = 0.1;

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

export const APP_DEFAULT_OPTIONS = {
  autoResetPopup: true,
  enableNotifacation: true,
  quickAddTaskTasklistId: '',
  enableQuickAdd: true,
  quickTaskTitleType: EQuickTaskTitle.SELECTION,
};

export const BUY_ME_COFFEE_DEFAULT_OPTIONS = {
  text: 'Buy me a coffee',
  slug: 'waynegong',
  button_colour: '0078d4',
  font_colour: 'ffffff',
  font_family: 'Cookie',
  outline_colour: 'ffffff',
  coffee_colour: 'ffffff',
};

export const QUICK_ADD_MENU_ITEMS = [
  {
    id: 'QUICK_ADD',
    title: LNAG_QUICK_ADD_TASK,
    contexts: ['all'],
  },
];
