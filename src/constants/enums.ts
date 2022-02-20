export enum ETaskContentTypes {
  TEXT = 'text',
  HTML = 'html',
}

export enum ETaskStatus {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
  waitingOnOthers = 'waitingOnOthers',
  deferred = 'deferred',
}

export enum ETaskImportance {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum TimeZone {
  UTC = 'UTC',
}

export enum NotifyType {
  TODO,
  TASK,
  TASKLIST,
}

export enum Page {
  POPUP,
  BACKGROUND,
  OPTIONS,
}

export enum EContentMessage {
  CURSOR_LOADING,
  CURSOR_RESET,
}

export enum ErrorCode {
  UNKNOW = -1,
  LOGIN_REDIRECT,
  ACQUIRE_TOKEN_REDIRECT,
  LAUNCH_WEB_AUTH_FLOW,
  HANDLE_REDIRECT_PROMISE,
  LOGOUT_REDIRECT,
  ACQUIRE_TOKEN_SILENT,
  ACQUIRE_TOKEN,
  CREATE_TAB,
  QUERY_TAB,
  NOT_FOUND_TAB,
  SEND_MESSAGE,
  CREATE_MENU,
  NOTIFY_SHOW,
  NOTIFY_CLEAR,
  REQUEST,
  RESPONSE,
}

export enum EThemes {
  BASIC = 'basic',
  DEFAULT = 'default',
}

export enum EQuickTaskTitle {
  SELECTION = 'SELECTION',
  ACTIVE_TAB = 'ACTIVE_TAB',
}


export enum ETARGET {
  CHROME = "chrome",
  EDGE = 'edge',
  FIREFOX = "firefox"
}