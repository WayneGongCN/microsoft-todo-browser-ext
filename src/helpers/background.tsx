import { BackgroundContext } from '../../types';
import { ErrorCode } from '../constants/enums';
import AppError from './error';
import { now, timing } from './report';

export let backgroundContext: BackgroundContext;

const loadBackground = (): Promise<BackgroundContext> => {
  const startTime = now();
  return new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage((ctx: Window & { backgroundContext: BackgroundContext }) => {
      timing('background loaded', now() - startTime);
      const lastError = chrome.runtime.lastError;
      if (lastError) return reject(new AppError({ code: ErrorCode.GET_BACKGROUND_PAGE, message: lastError.message }));
      backgroundContext = ctx.backgroundContext;
      return resolve(backgroundContext);
    });
  });
};

/**
 * 获取 Background 页面的上下文
 */
export const getBackgroundCtx = async (): Promise<BackgroundContext> => {
  return backgroundContext || (await loadBackground());
};
