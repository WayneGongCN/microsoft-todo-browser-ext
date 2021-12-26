export enum ETaskContentTypes {
  TEXT = "text",
  HTML = "html",
}


export enum ETaskStatus {
  notStarted = "notStarted",
  inProgress = "inProgress",
  completed = "completed",
  waitingOnOthers = "waitingOnOthers",
  deferred = "deferred",
}


export enum ETaskImportance {
  HIGH = "high",
  NORMAL = "normal",
  LOW = "low",
}


export enum TimeZone {
  UTC = 'UTC'
}

export enum NotifyType {
  TODO,
  TASK,
  TASKLIST
}