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
  CANCEL_LOGIN,
  LOGOUT,
  NOT_FOUND_ACCOUNT,
  ACQUIRE_TOKEN,
  ACQUIRE_TOKEN_SILENT,
  GET_BACKGROUND_PAGE,
  CREATE_TAB,
  QUERY_TAB,
  NOT_FOUND_TAB,
  SEND_MESSAGE,
  LAUNCH_WEB_AUTH_FLOW,
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
