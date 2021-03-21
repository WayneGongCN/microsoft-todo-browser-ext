
export enum ETaskContentTypes {
  text = 'text',
  html = 'html'
}

export enum ETaskStatus {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
  waitingOnOthers = 'waitingOnOthers',
  deferred = 'deferred',
}

export enum ETaskImportance {
  high = 'high',
  normal = 'normal',
  low = 'low'
}

export enum EAppActionTypes {
  GET_ACCOUNTS = 'GET_ACCOUNTS',

  CREATE_TASK_START = 'CREATE_TASK_START',
  CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS',
  CREATE_TASK_ERROR = 'CREATE_TASK_ERROR',

  LOG_OUT_START = 'LOG_OUT_START',
  LOG_OUT_SUCCESS = 'LOG_OUT_START',
  LOG_OUT_ERROR = 'LOG_OUT_START',

  FETCH_OAUTH_TOKEN_START = 'FETCH_OAUTH_TOKEN_START',
  FETCH_OAUTH_TOKEN_SUCCESS = 'FETCH_OAUTH_TOKEN_SUCCESS',
  FETCH_OAUTH_TOKEN_ERROR = 'FETCH_OAUTH_TOKEN_ERROR',

  FETCH_TASKLIST_LIST_START = 'FETCH_TASKLIST_LIST_START',
  FETCH_TASKLIST_LIST_SUCCESS = 'FETCH_TASKLIST_LIST_SUCCESS',
  FETCH_TASKLIST_LIST_ERROR = 'FETCH_TASKLIST_LIST_ERROR',
}
