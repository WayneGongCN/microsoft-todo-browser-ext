import React from 'react';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { BackgroundContext } from '../../types';
import { ErrorCode, EThemes } from '../constants/enums';
import AppError from './error';
import { logger } from './logger';

/**
 * 获取 Background 页面的上下文
 */
export const getBackgroundCtx = () => {
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
export const loadTheme = (theme: EThemes) => {
  logger.time(`load theme: ${theme}`);
  return lazy(() =>
    import(`../themes/${theme}/`).then((res) => {
      logger.timeEnd(`load theme: ${theme}`);
      return res;
    })
  );
};

/**
 * 为 Component 包裹 Provider store
 * @param theme
 * @returns
 */
export let backgroundContext: BackgroundContext;
export const storeWrap = (Component: React.LazyExoticComponent<React.ComponentType<any>> | React.FC) => {
    return lazy(async () => {
      backgroundContext = await getBackgroundCtx();
      return {
        default: () => (
          <Provider store={backgroundContext.store}>
            <Component />
          </Provider>
        ),
      } as never;
    });
}
