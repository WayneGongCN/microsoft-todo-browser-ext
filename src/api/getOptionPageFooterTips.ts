import { HOME_URL } from "../constants";
import request from "../helpers/request";


export interface OptionPageFooterTipsConf {
  content: Record<string, string>,
  link: string | Record<string, string>,
}


/**
 * 
 */
export const getOptionPageFooterTipsRequest = async (): Promise<OptionPageFooterTipsConf> => {
  return request(`${HOME_URL}/api/v1/optionPageFooterTips.json`)
}