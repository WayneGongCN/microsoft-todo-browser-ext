import { API_BASE_URL } from "../constants";
import { ErrorCode } from "../constants/enums";
import AppError from "../helpers/error";
import { makeAuthHeader } from "../helpers/msal";
import request from "../helpers/request";



export interface ITodolistsResult {
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


/**
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todo-list-lists.md
 */
export const getTodolistsRequest = async () => {
  const authHeader = await makeAuthHeader()
  return request<ITodolistsResult>(`${API_BASE_URL}/me/todo/lists`, { headers: authHeader })
    .catch(async e => {
      const { status } = e
      const body = await e.text()
      throw new AppError({ code: ErrorCode.REQUEST_TODOLISTS, message: `Request status ${status} ${body}` })
    })
}