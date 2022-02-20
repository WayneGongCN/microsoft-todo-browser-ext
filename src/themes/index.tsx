import { lazy } from "react";
import { EThemes, Page } from "../constants/enums";
import { now, timing, initReport } from "../helpers/report";

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