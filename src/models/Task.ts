/* eslint-disable */
import { ETaskImportance, ETaskStatus } from 'src/constants/enums';
import ModelBase from './ModelBase';

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotask.md
export class Task extends ModelBase implements ITask {
  tasklistId: string

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

  constructor(task: ITaskProperty) {
    super();

    this.body = task.body
    this.bodyLastModifiedDateTime = task.bodyLastModifiedDateTime
    this.completedDateTime = task.completedDateTime
    this.createdDateTime = task.createdDateTime
    this.dueDateTime = task.dueDateTime
    this.id = task.id
    this.importance = task.importance
    this.isReminderOn = task.isReminderOn
    this.lastModifiedDateTime = task.lastModifiedDateTime
    this.recurrence = task.recurrence
    this.reminderDateTime = task.reminderDateTime
    this.status = task.status
    this.title = task.title
  }
  
  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  create(tasklistId: string) {
    const path = `todo/lists/${tasklistId}/tasks`;
    return Task.post(path, this).then((task: ITaskProperty) => new Task(task));
  }

  // Get task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-get.md
  getTask() {
    const { tasklistId, id } = this
    const path = `me/todo/lists/${tasklistId}/tasks/${id}`
    return Task.get(path).then((task: ITaskProperty) => new Task(task));
  }

  // Update todoTask
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-update.md
  update() {
    const { tasklistId, id } = this
    const path = `todo/lists/${tasklistId}/tasks/${id}`
    return Task.patch(path, this).then((task: ITaskProperty) => new Task(task));
  }

  // Delete todoTask
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-delete.md
  delete() {
    const { tasklistId, id } = this
    const path = `todo/lists/${tasklistId}/tasks/${id}`
    // TODO: any
    return Task.delete<any>(path);
  }

  // List linkedResources
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-list-linkedresources.md
  listLinkedResources() {
    return Task.get(`todo/lists/${this.tasklistId}/tasks/${this.id}/linkedResources`);
  }

  // Create linkedResource
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-post-linkedresources.md
  createLinkedResource() {
    const endPoint = `todo/lists/${this.tasklistId}/tasks/${this.id}/linkedResources`;
    const data = {
      webUrl: '',
      applicationName: '',
      displayName: '',
      externalId: '',
    };
    return Task.post(endPoint, data);
  }

  delta() {
    return Task.get(`me/todo/lists/${this.id}/tasks/delta`);
  }
}

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotasklist.md
export class Tasklist extends ModelBase implements ITasklist {
  id: string
  isOwner: Boolean
  isShared: Boolean
  wellknownListName: string
  displayName: string

  constructor(taskList: ITasklistProperty) {
    super();
    if (taskList) {
      this.id = taskList.id;
      this.isOwner = taskList.isOwner;
      this.isShared = taskList.isShared;
      this.wellknownListName = taskList.wellknownListName;
      this.displayName = taskList.displayName;
    }
  }

  // Fetch tasklists
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-list-lists.md
  static fetchTasklists() {
    return Tasklist.get(`me/todo/lists`).then((list: IAjaxListResult<ITasklistProperty>) => list.value.map((x) => new Tasklist(x)));
  }

  // Create todoTasklist
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-post-lists.md
  create() {
    const endPoint = `me/todo/lists`;
    const data = { displayName: this.displayName || '' };
    return Tasklist.post<ITasklistProperty>(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Get task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-get.md
  getTasklist() {
    return Tasklist.get<ITasklistProperty>(`me/todo/lists/${this.id}`).then((taskList) => new Tasklist(taskList));
  }

  // Update task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-update.md
  update() {
    const endPoint = `me/todo/lists/${this.id}`;
    const data = { displayName: this.displayName || '' };
    return Tasklist.patch<ITasklistProperty>(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Delete task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-delete.md
  delete() {
    const endPoint = `me/todo/lists/${this.id}`;
    return Tasklist.delete(endPoint);
  }

  // List tasks
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-list-tasks.md
  listTasks() {
    const endPoint = `me/todo/lists/${this.id}/tasks`;
    return Tasklist.get<IAjaxListResult<ITaskProperty>>(endPoint).then((res) => res.value.map((x) => new Task(x)));
  }

  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  createTask(task: ITaskProperty) {
    const endPoint = `me/todo/lists/${this.id}/tasks`;
    return Tasklist.post<ITaskProperty>(endPoint, task)
      .then((res) => {
        const taskInstance = new Task(res);
        taskInstance.tasklistId = this.id;
        return taskInstance;
      });
  }
}
