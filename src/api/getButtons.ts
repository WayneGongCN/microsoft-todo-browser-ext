import { HOME_URL } from "../constants";
import request from "../helpers/request";


export interface OptionPageFooterButton {
  name: string;
  content: Record<string, string>;
  link: string | Record<string, string>;
  props: any;
}


/**
 * 
 */
export const getButtonsRequest = async (): Promise<OptionPageFooterButton[]> => {
  return request(`${HOME_URL}/api/v1/optionPageFooterButtons.json`)
}