import { lazy } from "react";
import { EThemes } from "../constants/enums";
import { now, timing } from "../helpers/report";


/**
 * 异步加载 Theme
 * @param theme
 * @returns
 */
 export const loadTheme = (theme: EThemes) => {
  const startTime = now();
  return lazy(() =>
    import(`../themes/${theme}/`).then(async (res) => {
      timing('theme loaded', now() - startTime);
      return res;
    })
  );
};