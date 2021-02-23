/* eslint-disable */
import ModelBase from './ModelBase';

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotask.md
export class Task extends ModelBase {
  constructor(task) {
    super();

    this.id = task.id;
    this.body = task.body;
    this.completedDateTime = task.completedDateTime;
    this.dueDateTime = task.dueDateTime;
    this.importance = task.importance;
    this.isReminderOn = task.isReminderOn;
    this.recurrence = task.recurrence;
    this.reminderDateTime = task.reminderDateTime;
    this.status = task.status;
    this.title = task.title;
    this.createdDateTime = task.createdDateTime;
    this.lastModifiedDateTime = task.lastModifiedDateTime;
    this.bodyLastModifiedDateTime = task.bodyLastModifiedDateTime;
  }

  // List tasks
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-list-tasks.md
  static listTasks(taskListId) {
    return new Tasklist({ id: taskListId }).listTasks();
  }

  setTasklistId(tasklistId) {
    this.tasklistId = tasklistId;
  }

  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  create() {
    const endPoint = `${this.endPointPrefix}todo/lists/${this.taskListId}/tasks`;
    const data = Task.mapping(this);
    return this.post(endPoint, data).then((task) => new Task(task));
  }

  // Get task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-get.md
  getTask() {
    return this.get(`${this.endPointPrefix}/me/todo/lists/${this.taskListId}/tasks/${this.id}`).then((task) => new Task(task));
  }

  // Update todoTask
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-update.md
  update() {
    const endPoint = `${this.endPointPrefix}todo/lists/${this.taskListId}/tasks/${this.id}`;
    const data = Task.mapping(this);
    return this.patch(endPoint, data).then((task) => new Task(task));
  }

  // Delete todoTask
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-delete.md
  delete() {
    return super.delete(`${this.endPointPrefix}todo/lists/${this.taskListId}/tasks/${this.id}`);
  }

  // List linkedResources
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-list-linkedresources.md
  listLinkedResources() {
    return this.get(`${this.endPointPrefix}todo/lists/${this.taskListId}/tasks/${this.id}/linkedResources`);
  }

  // Create linkedResource
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-post-linkedresources.md
  createLinkedResource() {
    const endPoint = `${this.endPointPrefix}todo/lists/${this.taskListId}/tasks/${this.id}/linkedResources`;
    const data = {
      webUrl: '',
      applicationName: '',
      displayName: '',
      externalId: '',
    };
    return this.post(endPoint, data);
  }

  delta() {
    return this.get(`${this.endPointPrefix}/me/todo/lists/${this.id}/tasks/delta`);
  }

  static mapping(meta) {
    const {
      title,
      describe = '',
      contentType = 'text',
      reminderDateTime = '',
      timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone,
      importance = false,
      bookmarked = false,
      bookmarkInfo
    } = meta

    const result = {
      title,
      body: {
        contentType,
        content: describe,
      },
      importance: importance ? 'high' : 'low',
      reminderDateTime: {
        timeZone,
        dateTime: reminderDateTime,
      }
    }

    !reminderDateTime && (delete result.reminderDateTime)
    bookmarked && (result.body.content += (bookmarked ? bookmarkInfo : ''))

    return result
  }
}

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotasklist.md
export class Tasklist extends ModelBase {
  constructor(taskList) {
    super();

    if (taskList) {
      this.id = taskList.id;
      this.isOwner = taskList.isOwner;
      this.isShared = taskList.isShared;
      this.wellknownListName = taskList.wellknownListName;

      this.displayName = taskList.displayName;
    }
  }

  // List lists
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-list-lists.md
  listTasklist() {
    return this.get(`${this.endPointPrefix}me/todo/lists`).then((list) => list.value.map((x) => new Tasklist(x)));
  }

  // Create todoTasklist
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-post-lists.md
  create() {
    const endPoint = `${this.endPointPrefix}me/todo/lists`;
    const data = { displayName: this.displayName || '' };
    return this.post(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Get task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-get.md
  getTasklist() {
    return this.get(`${this.endPointPrefix}me/todo/lists/${this.id}`).then((taskList) => new Tasklist(taskList));
  }

  // Update task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-update.md
  update() {
    const endPoint = `${this.endPointPrefix}me/todo/lists/${this.id}`;
    const data = { displayName: this.displayName || '' };
    return this.patch(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Delete task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-delete.md
  delete() {
    const endPoint = `${this.endPointPrefix}me/todo/lists/${this.id}`;
    return super.delete(endPoint);
  }

  // List tasks
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-list-tasks.md
  listTasks() {
    const endPoint = `${this.endPointPrefix}me/todo/lists/${this.id}/tasks`;
    return this.get(endPoint).then((res) => res.value.map((x) => new Task(x)));
  }

  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  createTask(taskMeta) {
    const endPoint = `${this.endPointPrefix}me/todo/lists/${this.id}/tasks`;
    const data = Task.mapping(taskMeta);
    return this.post(endPoint, data)
      .then((res) => {
        const taskInstance = new Task(res);
        taskInstance.setTasklistId(this.id);
        return taskInstance;
      });
  }
}
