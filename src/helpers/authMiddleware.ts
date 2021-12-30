import { State } from "../redux";
import { authentication } from "../redux/auth";
import { logger } from "./logger";

let authPromise: Promise<void> = null;

const authMiddleware = (store: any) => (next: any) => (action: any) => {
  // logger.log("authMiddleware", action.type);
  const { type, meta, payload } = action;
  if (!type) return next(action);
  if (type.includes("authenticationResult")) return next(action);

  const state: State = store.getState();
  let accessToken = state.auth.authenticationResult?.accessToken;

  if (accessToken) {
    // logger.log('已有 token', action.type)
    action.meta = {
      ...meta,
      accessToken,
    };
    return next(action);
  } else {
    if (authPromise) {
      // logger.log('正在获取 token 拦截 action', action.type)
      authPromise.then(() => {
        // logger.log('token 获取成功1，放过 action', action.type)
        next(action);
      });
    } else {
      authPromise = store.dispatch(authentication())
      // logger.log('开始获取 token', action.type, authPromise)
      
      authPromise.then(() => {
        // logger.log('token 获取成功2，放过 action', action.type)
        next(action)
      });
    }
  }
};

export default authMiddleware;
