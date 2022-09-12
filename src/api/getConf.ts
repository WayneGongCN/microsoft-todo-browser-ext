import { HOME_URL } from "../constants";
import request from "../helpers/request";


interface AppConf {
  sentryDsn: string;
  reportSampleRate: 0.1;
  gtmID: string;
  gtmEvn: string;
}


/**
 * 
 */
export const getConfRequest = async () => {
  return request<AppConf>(`${HOME_URL}/api/v1/conf.json`)
}