import { AuthenticationResult } from '@azure/msal-browser';
import { backgroundContext } from '../src/pages/background';
import { ETaskContentTypes, ETaskImportance, ETaskStatus, TimeZone } from '../src/constants/enums';
import { EContentMessage } from '../src/content';
import { ErrorCode } from '../src/helpers/error';

declare global {
  interface Window {
    __IS_DEV: boolean;
    __IS_PROD: boolean;
    __VERSION: string;
    __BUILD_TARGET: string;
    backgroundContext: typeof backgroundContext;
  }
}
interface ITaskBody {
  contentType: ETaskContentTypes;
  content: string;
}

interface ITaskReminderDateTime {
  timeZone: TimeZone;
  dateTime: string;
}

/**
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md#request-body
 */
interface ICreateTaskParams {
  id?: string; // 	Unique identifier for the task. By default, this value changes when the item is moved from one list to another.
  body?: ITaskBody; // 	The task body that typically contains information about the task.
  completedDateTime?: string; // 	The date in the specified time zone that the task was finished.
  dueDateTime?: string; // 	The date in the specified time zone that the task is to be finished.
  importance?: ETaskImportance; // 	The importance of the task. Possible values are: low, normal, high.
  isReminderOn?: boolean; // 	Set to true if an alert is set to remind the user of the task.
  recurrence?: any; // 	The recurrence pattern for the task.
  reminderDateTime?: ITaskReminderDateTime; // 	The date and time for a reminder alert of the task to occur.
  status?: ETaskStatus; // 	Indicates the state or progress of the task. Possible values are: notStarted, inProgress, completed, waitingOnOthers, deferred.
  title: string; // 	A brief description of the task.
  createdDateTime?: string; // 	The date and time when the task was created. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  lastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
  bodyLastModifiedDateTime?: string; // 	The date and time when the task was last modified. By default, it is in UTC. You can provide a custom time zone in the request header. The property value uses ISO 8601 format and is always in UTC time. For example, midnight UTC on Jan 1, 2020 would look like this: '2020-01-01T00:00:00Z'.
}

interface IPopupForm {
  id?: string;
  tasklistId: string;
  title?: string;
  describe?: string;
  dateTime?: string;
  importance?: boolean;
  bookmark?: boolean;
}

interface ITasklistResult {
  '@odata.context': string;
  value: {
    '@odata.etag': string;
    displayName: string;
    id: string;
    isOwner: boolean;
    isShared: boolean;
    wellknownListName: string;
  }[];
}

interface ITasksResult {
  '@odata.context': string;
  value: ITask[];
}

interface ITaskResult {
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

interface IContentMessage {
  type: EContentMessage;
  payload?: any;
}

interface SerializError {
  code: ErrorCode;
  message: string;
  stack: string;
  time: number;
}

interface IBuyMeACoffeeOptions {
  text?: string;
  emoji?: string;
  slug?: string;
  button_colour?: string;
  font_colour?: string;
  font_family?: string;
  outline_colour?: string;
  coffee_colour?: string;
}

type Modify<T, R> = Omit<T, keyof R> & R;

type BackgroundContext = typeof backgroundContext;

type SerializAuthenticationResult = Modify<
  AuthenticationResult,
  {
    expiresOn: number;
    extExpiresOn: number;
  }
>;
