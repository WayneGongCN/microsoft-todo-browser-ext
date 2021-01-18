import ModelBase from './ModelBase';
// eslint-disable-next-line import/no-cycle
import Task from './Task';

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/resources/todotasklist.md
class Tasklist extends ModelBase {
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
    return this.get('https://graph.microsoft.com/v1.0/me/todo/lists').then((list) => list.value.map((x) => new Tasklist(x)));
  }

  // Create todoTasklist
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-post-lists.md
  create() {
    const endPoint = 'https://graph.microsoft.com/v1.0/me/todo/lists';
    const data = { displayName: this.displayName || '' };
    return this.post(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Get task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-get.md
  getTasklist() {
    return this.get(`https://graph.microsoft.com/v1.0/me/todo/lists/${this.id}`).then((taskList) => new Tasklist(taskList));
  }

  // Update task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-update.md
  update() {
    const endPoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${this.id}`;
    const data = { displayName: this.displayName || '' };
    return this.patch(endPoint, data).then((taskList) => new Tasklist(taskList));
  }

  // Delete task list
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-delete.md
  delete() {
    const endPoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${this.id}`;
    return super.delete(endPoint);
  }

  // List tasks
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-list-tasks.md
  listTasks() {
    const endPoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${this.id}/tasks`;
    return this.get(endPoint).then((res) => res.value.map((x) => new Task(x)));
  }

  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  createTask(task) {
    const endPoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${this.id}/tasks`;
    const data = Task.mapping(task);
    return this.post(endPoint, data).then((res) => new Task(res));
  }
}

export default Tasklist;
