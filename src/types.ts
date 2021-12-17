import { PublicClientApplication } from "@azure/msal-browser";
import { backgroundContext } from "./background";
import Task from "./classes/Task";
import Tasklist from "./classes/TaskList";
import { store } from "./redux";
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

// interface ITaskBody {
//   contentType: ETaskContentTypes;
//   content: string;
// }

// interface ITaskReminderDateTime {
//   timeZone: string;
//   dateTime: string;
// }

/**
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md#request-body
 */
export interface ICreateTaskParams {
  id?: string; // 	Unique identifier for the task. By default, this value changes when the item is moved from one list to another.
  body?: ITaskBody;  // 	The task body that typically contains information about the task.
  completedDateTime?: string;  // 	The date in the specified time zone that the task was finished.
  dueDateTime?: string;  // 	The date in the specified time zone that the task is to be finished.
  importance?: ETaskImportance;  // 	The importance of the task. Possible values are: low, normal, high.
  isReminderOn?: Boolean;  // 	Set to true if an alert is set to remind the user of the task.
  recurrence?: any;  // 	The recurrence pattern for the task.
  reminderDateTime?: ITaskReminderDateTime;  // 	The date and time for a reminder alert of the task to occur.
  status?: ETaskStatus;  // 	Indicates the state or progress of the task. Possible values are: notStarted, inProgress, completed, waitingOnOthers, deferred.
  title: string;  // 	A brief description of the task.
  createdDateTime?: string;  // 	The date and time when the task was created. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  lastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  bodyLastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
}

// interface ITasklistProperty {
//?   id: string;
//   isOwner: Boolean;
//   isShared: Boolean;
//   wellknownListName: string;
//   displayName: string;
// }

export interface ITasklistResult {
  "@odata.context": string;
  value: {
    "@odata.etag": string;
    displayName: string;
    id: string;
    isOwner: boolean;
    isShared: boolean;
    wellknownListName: string;
  }[];
}

export type BackgroundContext = typeof backgroundContext;
