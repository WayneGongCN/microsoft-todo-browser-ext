import { PublicClientApplication } from "@azure/msal-browser";
import { backgroundContext } from "./background";
import Task from "./classes/Task";
import Tasklist from "./classes/TaskList";
import { store } from './redux'
import { appSlice } from "./redux/app";

enum ETaskContentTypes {
  text = "text",
  html = "html",
}

enum ETaskImportance {
  high = "high",
  normal = "normal",
  low = "low",
}

enum ETaskStatus {
  notStarted = "notStarted",
  inProgress = "inProgress",
  completed = "completed",
  waitingOnOthers = "waitingOnOthers",
  deferred = "deferred",
}

interface ITaskBody {
  contentType: ETaskContentTypes;
  content: string;
}

interface ITaskReminderDateTime {
  timeZone: string;
  dateTime: string;
}

interface ITaskProperty {
  id: string;
  status: ETaskStatus;
  title: string;
  body: ITaskBody;
  bodyLastModifiedDateTime: string;
  completedDateTime: string;
  createdDateTime: string;
  dueDateTime: string;
  importance: ETaskImportance;
  isReminderOn: Boolean;
  lastModifiedDateTime: string;
  recurrence: any;
  reminderDateTime: ITaskReminderDateTime;
}

interface ITasklistProperty {
  id: string;
  isOwner: Boolean;
  isShared: Boolean;
  wellknownListName: string;
  displayName: string;
}

export type BackgroundContext = typeof backgroundContext