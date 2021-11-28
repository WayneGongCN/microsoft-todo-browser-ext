import { lazy } from "react";

export enum EThemes {
  BASIC = "basic",
  DEFAULT = "default",
}

export const loadTheme = (theme: EThemes) => {
  return lazy(() => import(`./${theme}/`));
};
