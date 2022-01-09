import { IPopupForm } from '../../types';
import { EQuickTaskTitle, TimeZone } from './enums';

export const EXT_ID = chrome.runtime.id;
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const API_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const AUTH_SCOPES = ['profile', 'Tasks.ReadWrite'];
export const API_TIME_OUT = 1000 * 60;

export const TIME_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;

export const ISSUE_URL = 'https://github.com/WayneGongCN/microsoft-todo-browser-ext/issues/new';
export const RATE_URL = 'https://chrome.google.com/webstore/detail/microsoft-to-do-browser-e/ffpljgmbiankjaokoefefmkoghcgoodn/reviews';

export const NOTIFICATION_ICON_URL = `chrome-extension://${EXT_ID}/icons/todo-128.png`;
export const NOTIFICATION_TYPE = 'basic';

export const REPORT_SAMPLE_RATE = 1;

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
  enableBuyMeACoffee: true,
  quickTaskTitleType: EQuickTaskTitle.SELECTION,
  // enableLog: !IS_DEV
  // enableReportError: true,
  // rememberLastUseTasklist: true,
  // timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;
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
