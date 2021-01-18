/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-cycle */
import ModelBase from './ModelBase';
import Tasklist from './Tasklist';

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotask.md
class Task extends ModelBase {
  constructor(task) {
    super();

    this.id = task.id;
    this.taskListId = task.taskListId;

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

  static mapping(task) {
    return {
      id: task.id || undefined,
      body: task.body || undefined,
      completedDateTime: task.completedDateTime || undefined,
      dueDateTime: task.dueDateTime || undefined,
      importance: task.importance || undefined,
      isReminderOn: task.isReminderOn || undefined,
      recurrence: task.recurrence || undefined,
      reminderDateTime: task.reminderDateTime || undefined,
      status: task.status || undefined,
      title: task.title || undefined,
    };
  }
}

export default Task;
