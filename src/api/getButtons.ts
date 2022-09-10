import { HOME_URL } from "../constants";
import request from "../helpers/request";


export interface ButtonConf {
  name: string;
  text: Record<string, string>;
  url: Record<string, string>;
  props: any;
}


/**
 * 
 */
export const getButtonsRequest = async () => {
  return request
    .request<ButtonConf[]>({ baseURL: HOME_URL, url: '/api/v1/optionFooterButtons.json' })
    .then((res) => res.data);
}