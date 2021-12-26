import {
  AuthenticationResult,
  PublicClientApplication,
  RedirectRequest,
} from "@azure/msal-browser";
import { EXT_ID } from "../constants";

const DEFAULT_MSAL_CONF = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: `https://${EXT_ID}.chromiumapp.org/`,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const msalInstance = (window as any).msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);
msalInstance.getAllAccounts();


/**
 * 
 */
const clearAccount = () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
};


/**
 * 退出登录
 * @returns 
 */
export const logout = () => {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url: string) => {
      chrome.identity.launchWebAuthFlow(
        { url, interactive: true },
        (responseUrl) => {
          clearAccount();
          resolve(responseUrl);
        }
      );
    };

    msalInstance.logoutRedirect({ onRedirectNavigate }).catch(reject);
  });
};
(window as any).logout = logout



/**
 * 
 * @param request 
 * @returns 
 * 
 * https://developer.chrome.com/docs/apps/app_identity/#non
 */
export const authentication = (
  request: RedirectRequest
) => {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url: string) => {
      // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
      chrome.identity.launchWebAuthFlow(
        { url, interactive: true },
        (hashUrl) => {
          if (chrome.runtime.lastError) {
            clearAccount();
            return reject(chrome.runtime.lastError.message);
          }
          return (
            msalInstance
              .handleRedirectPromise(hashUrl)
              // TODO
              .then(resolve)
              .catch((e) => {
                clearAccount();
                reject(e);
              })
          );
        }
      );
    };

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/pull/2669
    // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-core/classes/_useragentapplication_.useragentapplication.html#acquiretokenredirect
    msalInstance
      .acquireTokenRedirect({ onRedirectNavigate, ...request })
      .catch((e: any) => {
        clearAccount();
        reject(e);
      });
  })
    .then((res: AuthenticationResult) => ({
      ...res,
      expiresOn: new Date(res.expiresOn).getTime(),
      extExpiresOn: new Date(res.extExpiresOn).getTime(),
    }))
};
(window as any).authentication = authentication

