import { API_BASE_URL } from "../constants";
import { ErrorCode } from "../constants/enums";
import AppError from "../helpers/error";
import { makeAuthHeader } from "../helpers/msal";
import request from "../helpers/request";


export enum ETaskContentTypes {
  TEXT = 'text',
  HTML = 'html',
}



export enum ETaskImportance {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}



export enum TimeZone {
  UTC = 'UTC',
}



export enum ETaskStatus {
  notStarted = 'notStarted',
  inProgress = 'inProgress',
  completed = 'completed',
  waitingOnOthers = 'waitingOnOthers',
  deferred = 'deferred',
}



export interface CreateTaskResult {
  '@odata.etag': string;
  body: unknown;
  createdDateTime: string;
  dueDateTime: any;
  id: string;
  importance: 'normal';
  isReminderOn: false;
  lastModifiedDateTime: string;
  recurrence: unknown;
  status: string;
  title: string;
}



export interface ITaskBody {
  contentType: ETaskContentTypes;
  content: string;
}



export interface ITaskReminderDateTime {
  timeZone: TimeZone;
  dateTime: string;
}



export interface CreateTaskParams {
  title: string; // 	A brief description of the task.

  id?: string; // 	Unique identifier for the task. By default, this value changes when the item is moved from one list to another.
  body?: ITaskBody; // 	The task body that typically contains information about the task.
  completedDateTime?: string; // 	The date in the specified time zone that the task was finished.
  dueDateTime?: string; // 	The date in the specified time zone that the task is to be finished.
  importance?: ETaskImportance; // 	The importance of the task. Possible values are: low, normal, high.
  isReminderOn?: boolean; // 	Set to true if an alert is set to remind the user of the task.
  recurrence?: any; // 	The recurrence pattern for the task.
  reminderDateTime?: ITaskReminderDateTime; // 	The date and time for a reminder alert of the task to occur.
  status?: ETaskStatus; // 	Indicates the state or progress of the task. Possible values are: notStarted, inProgress, completed, waitingOnOthers, deferred.
  createdDateTime?: string; // 	The date and time when the task was created. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  lastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  bodyLastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
}


/**
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTaskRequest = async (tasklistId: string, task: CreateTaskParams) => {
  const authHeader = await makeAuthHeader()

  return request<CreateTaskResult>(`${API_BASE_URL}/me/todo/lists/${tasklistId}/tasks`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify(task)
  })
    .catch( async e => {
      const { status } = e
      const body = await e.text()
      throw new AppError({ code: ErrorCode.REQUEST_CREATE_TASK, message: `Request status ${status} ${body}` })
    })
}

