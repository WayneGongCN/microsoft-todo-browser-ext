import { ErrorCode } from "../constants/enums";
import { makeAuthHeader } from "../helpers";
import AppError from "../helpers/error";
import request from "../helpers/request"



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
  const endPoint = 'me/todo/lists'
  return request.get<ITodolistsResult>(endPoint, { headers: authHeader })
    .then(res => res.data)
    .catch(e => {
      throw new AppError({ code: ErrorCode.REQUEST_TODOLISTS, message: e?.message })
    })
}