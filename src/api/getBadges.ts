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
export const getBadgesRequest = async (): Promise<BadgeConf[]> => {
  return request(`${HOME_URL}/api/v1/badges.json`)
}