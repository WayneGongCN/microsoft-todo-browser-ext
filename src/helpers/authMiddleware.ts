import { State } from "../redux";
import { authentication } from "./msal";

const authMiddleware = (store: any) => (next: any) => (action: any) => {
  const { type, meta, payload } = action;
  if (!type) return next(action);
  if (type.includes("authenticationResult")) return next(action);

  const { requestId } = meta || {};
  if (!requestId) return next(action);

  const state: State = store.getState();
  let accessToken = state.auth.authenticationResult?.accessToken;

  if (accessToken) {
    action.meta = {
      ...meta,
      accessToken,
    };
    return next(action);
  } else {
    authentication({ scopes: state.auth.scopes })
      .then((payload) =>
        store.dispatch({ type: "app/authenticationResult/fulfilled", payload })
      )
      .then(() => next(action));
  }
};

export default authMiddleware;
