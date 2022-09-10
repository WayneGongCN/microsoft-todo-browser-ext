import { HOME_URL } from "../constants";
import request from "../helpers/request";


/**
 * 
 */
export const getConfRequest = async () => {
  return request
    .request({ baseURL: HOME_URL, url: '/api/v1/conf.json' })
    .then((res) => res.data);
}