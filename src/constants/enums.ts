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
}

export enum EContentMessage {
  CURSOR_LOADING,
  CURSOR_RESET,
}

export enum ErrorCode {
  UNKNOW = -1,
  NOT_FOUND_ACCOUNT,
  ACQUIRE_TOKEN,
  ACQUIRE_TOKEN_SILENT,
}

export enum EThemes {
  BASIC = 'basic',
  DEFAULT = 'default',
}
