import { IPublicClientApplication } from "@azure/msal-browser";
import { AccountInfo, AuthenticationResult } from "@azure/msal-common";
import { EAppActionTypes, ETaskContentTypes, ETaskImportance, ETaskStatus } from "src/constants/enums";
import getStore from "src/reducers";
import { Task, Tasklist } from "../src/models/Task";
import { StateType, ActionType } from 'typesafe-actions';


declare global {
  interface Window {
    Task: typeof Task
    Tasklist: typeof Tasklist

    getStore: typeof getStore
    msalInstance: IPublicClientApplication
  }


  interface IModeBase {

  }

  interface ITaskBody {
    contentType: ETaskContentTypes
    content: string
  }

  interface ITaskReminderDateTime {
    timeZone: string,
    dateTime: string
  }

  interface ITaskProperty {
    body: ITaskBody
    bodyLastModifiedDateTime: string
    completedDateTime: string
    createdDateTime: string
    dueDateTime: string
    id: string
    importance: ETaskImportance
    isReminderOn: Boolean
    lastModifiedDateTime: string
    recurrence: any
    reminderDateTime: ITaskReminderDateTime
    status: ETaskStatus
    title: string
  }

  interface ITask extends ITaskProperty {
    create(tasklistId: string): Promise<Task>
    update(): Promise<Task>
    delete(): Promise<any>

    // TODO
    listLinkedResources(): Promise<any>
    createLinkedResource(): Promise<any>
    delta(): Promise<any>
  }


  interface ITasklistProperty {
    id: string
    isOwner: Boolean
    isShared: Boolean
    wellknownListName: string
    displayName: string
  }

  interface IAjaxListResult<T> {
    value: T[]
  }
  interface ITasklist extends ITasklistProperty {
    create(): Promise<ITasklist>
    getTasklist(): Promise<ITasklist>
    update(): Promise<ITasklist>
    listTasks(): Promise<ITask[]>
    createTask(task: ITaskProperty): Promise<ITask>

    // TODO
    delete(): Promise<any>
  }

  interface IAppConf {

  }
  interface IUserConf {
    dateFormat: string,
    timeFormat: string,
    defalutTasklist: ITasklist | null,
    rememberLastUeseTasklist: Boolean,
    reportError: Boolean,
  }


  interface IAppStatus {
    // account
    account: AccountInfo,
    token: AuthenticationResult,
    loggingIn: Boolean,
    scopes: string[],

    // tasklist
    tasklists: ITasklist[],
    selectedTasklist: null | ITasklist,
    fetchingTasklists: Boolean,

    // task
    popupForm: IPopupFormProperty | null
    creatingTask: Boolean,

    // config
    appConf: IAppConf,
    userConf: IUserConf

    // debug
    error: any,
    log: any[]
  }

  interface IPopupFormProperty {

  }

  interface IAction<T, P> {
    type: T,
    payload: P
  }

  type ICreateTaskAction = IAction<EAppActionTypes.CREATE_TASK_START, ITask>
}

