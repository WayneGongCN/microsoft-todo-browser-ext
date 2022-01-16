import { BackgroundContext } from '../../types';
import { ErrorCode } from '../constants/enums';
import AppError from './error';
import { timing } from './report';

export let backgroundContext: BackgroundContext;

const loadBackground = () =>
  new Promise((resolve, reject) => {
    chrome.runtime.getBackgroundPage((ctx: Window & { backgroundContext: BackgroundContext }) => {
      timing('background loaded', performance.now())
      const lastError = chrome.runtime.lastError;
      if (lastError) reject(new AppError({ code: ErrorCode.UNKNOW, message: lastError?.message }));
      else {
        backgroundContext = ctx.backgroundContext
        resolve(backgroundContext);
      }
    });
  });

/**
 * 获取 Background 页面的上下文
 */
export const getBackgroundCtx = async () => {
  return backgroundContext || await loadBackground();
};
