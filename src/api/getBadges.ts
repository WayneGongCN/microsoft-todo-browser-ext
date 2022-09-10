import { HOME_URL } from "../constants";
import request from "../helpers/request";


export interface BadgeConf {
  name: string;
  img: Record<string, string>;
  url: Record<string, string>;
}

/**
 * 
 */
export const getBadgesRequest = async () => {
  return request
    .request<BadgeConf[]>({ baseURL: HOME_URL, url: '/api/v1/badges.json' })
    .then((res) => res.data);
}