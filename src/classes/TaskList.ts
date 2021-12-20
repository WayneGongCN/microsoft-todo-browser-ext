import { API_BASE_URL } from '../constants'
import request from '../helpers/request'

export default class Tasklist {
  id: string
  isOwner: Boolean
  isShared: Boolean
  wellknownListName: string
  displayName: string

  constructor() {
  }


  // Create todoTasklist
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todo-post-lists.md
  // create() {
  //   const endPoint = `me/todo/lists`;
  //   const data = { displayName: this.displayName || '' };
  //   return request.post<ITasklistProperty>(endPoint, data).then((taskList) => new Tasklist(taskList));
  // }

  // // Get task list
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-get.md
  // getTasklist() {
  //   return request.get<ITasklistProperty>(`me/todo/lists/${this.id}`).then((taskList) => new Tasklist(taskList));
  // }

  // // Update task list
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-update.md
  // update() {
  //   const endPoint = `me/todo/lists/${this.id}`;
  //   const data = { displayName: this.displayName || '' };
  //   return request.patch<ITasklistProperty>(endPoint, data).then((taskList) => new Tasklist(taskList));
  // }

  // // Delete task list
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-delete.md
  // delete() {
  //   const endPoint = `me/todo/lists/${this.id}`;
  //   return request.delete(endPoint);
  // }

  // // List tasks
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-list-tasks.md
  // listTasks() {
  //   const endPoint = `me/todo/lists/${this.id}/tasks`;
  //   return request.get<ITaskProperty[]>(endPoint)
  // }

  // // Create task
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  // createTask(task: ITaskProperty) {
  //   const endPoint = `me/todo/lists/${this.id}/tasks`;
  //   return request.post<ITaskProperty>(endPoint, task)
  // }
}
