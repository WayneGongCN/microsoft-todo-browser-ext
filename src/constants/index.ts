import { IPopupForm } from '../../types';
import { TimeZone } from './enums';

export const EXT_ID = chrome.runtime.id;
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const API_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const AUTH_SCOPES = ['profile', 'Tasks.ReadWrite'];
export const API_TIME_OUT = 1000 * 60;

export const TIME_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;
export const DATE_FORMAT = 'YYYY/MM/DD';
export const TIME_FORMAT = 'HH:mm:ss';

export const QUICK_ADD_DEFAULT_TASKLIST = '';
export const REMENBER_LAST_USE_TASKLIST = true;

export const REPORT_ERROR = true;
export const REPORT_SAMPLE_RATE = 1;

export const NOTIFICATION_ICON_URL = `chrome-extension://${EXT_ID}/icons/todo-128.png`;
export const NOTIFICATION_TYPE = 'basic';

export const AUTO_RESET_POPUP_FORM = true;
export const DEFAULT_FORM_VALS: IPopupForm = {
  title: '',
  describe: '',
  tasklistId: '',
  importance: false,
  bookmark: true,
  dateTime: '',
};

export const ENABLE_QUICK_ADD = true;
