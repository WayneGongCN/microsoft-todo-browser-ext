import React from 'react';
import AppError from '../helpers/error';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { BackgroundContext } from '../../types';
import { ErrorCode, EThemes } from '../constants/enums';
import { logger } from '../helpers/logger';

/**
 * 获取 Background 页面的上下文
 */
export let backgroundContext: BackgroundContext;
const getBackgroundCtx = () => {
  logger.time('getBackgroundPage');
  return new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage((ctx: Window & { backgroundContext: BackgroundContext }) => {
      logger.timeEnd('getBackgroundPage');
      logger.log('getBackgroundCtx: ', ctx.backgroundContext);
      const lastError = chrome.runtime.lastError;
      if (lastError) reject(new AppError({ code: ErrorCode.UNKNOW, message: lastError?.message }));
      else resolve(ctx.backgroundContext);
    });
  });
};

/**
 * 异步加载 Theme
 * @param theme
 * @returns
 */
const loadTheme = (theme: EThemes) => {
  logger.time(`load theme: ${theme}`);
  return lazy(() => {
    return import(`./${theme}/`).then((res) => {
      logger.timeEnd(`load theme: ${theme}`);
      return res;
    });
  });
};

/**
 * 为 Theme 包裹 Provider store
 * @param theme
 * @returns
 */
export const themeWrap = (theme: EThemes) =>
  lazy(async () => {
    backgroundContext = await getBackgroundCtx();
    const ThemeComponent = await loadTheme(theme);
    return {
      default: () => (
        <Provider store={backgroundContext.store}>
          <ThemeComponent />
        </Provider>
      ),
    } as never;
  });
