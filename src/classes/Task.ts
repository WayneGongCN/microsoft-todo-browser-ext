import { API_BASE_URL } from "../constants";
import request from "../helpers/request";

export default class Task {
  // private meta: ITaskPropert;
  id: any;

  constructor() {
    // this.meta = meta;
  }

  // Create task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
  static create(tasklistId: string) {
    const url = `${API_BASE_URL}/todo/lists/${tasklistId}/tasks`;
    return request.post(url)
  }

  // Get task
  // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-get.md
  static getTask({ tasklistId, id }: { tasklistId: string; id: string }) {
    const url = `${API_BASE_URL}/me/todo/lists/${tasklistId}/tasks/${id}`;
    return request.post(url);
  }

  // // Update todoTask
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-update.md
  // update() {
  //   const { tasklistId, id } = this.meta;
  //   const url = `${API_BASE_URL}/todo/lists/${tasklistId}/tasks/${id}`;
  //   return request.patch(url, this);
  // }

  // // Delete todoTask
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-delete.md
  // delete() {
  //   const { tasklistId, id } = this.meta;
  //   const url = `${API_BASE_URL}/todo/lists/${tasklistId}/tasks/${id}`;
  //   // TODO: any
  //   return request.delete<any>(url);
  // }

  // // List linkedResources
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-list-linkedresources.md
  // listLinkedResources() {
  //   const { tasklistId, id } = this.meta;

  //   const url = `${API_BASE_URL}/todo/lists/${tasklistId}/tasks/${id}/linkedResources`;
  //   return request.get(url);
  // }

  // // Create linkedResource
  // // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotask-post-linkedresources.md
  // createLinkedResource() {
  //   const { tasklistId, id } = this.meta;
  //   const url = `${API_BASE_URL}/todo/lists/${tasklistId}/tasks/${id}/linkedResources`;
  //   const data = {
  //     webUrl: "",
  //     applicationName: "",
  //     displayName: "",
  //     externalId: "",
  //   };
  //   return request.post(url, data);
  // }

  // delta() {
  //   const { id } = this.meta;
  //   return request.get(`me/todo/lists/${this.id}/tasks/delta`);
  // }
}
