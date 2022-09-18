import { HOME_URL } from "../constants";
import { logger } from "../helpers/logger";
import request from "../helpers/request";


export enum ConfKey {
  UNINSTALL_URL = 'uninstallUrl'
}
export type Conf = { type: ConfKey, value: string }


/**
 * 
 */
export const getConfRequest = async () => {
  return request<Conf[]>(`${HOME_URL}/api/v1/conf.json`)
}