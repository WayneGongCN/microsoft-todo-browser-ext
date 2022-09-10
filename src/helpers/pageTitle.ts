import { LANG_EXT_NAME } from "../constants/lang"

export const initPageTitle = () => {
  document.title += ` | ${LANG_EXT_NAME}`
}