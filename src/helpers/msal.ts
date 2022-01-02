import { AuthenticationResult, PublicClientApplication, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { SerializAuthenticationResult } from '../../types';
import { EXT_ID } from '../constants';
import { logger } from './logger';

const DEFAULT_MSAL_CONF = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: `https://${EXT_ID}.chromiumapp.org/`,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);

/**
 * 清空登录态
 */
const clearAccount = () => {
  logger.log('clear account');
  window.localStorage.clear();
  window.sessionStorage.clear();
};

/**
 * 退出登录
 */
export const logout = () => {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url: string) => {
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (responseUrl) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);

        clearAccount();
        resolve(responseUrl);
      });
    };

    msalInstance.logoutRedirect({ onRedirectNavigate }).catch(reject);
  });
};

const serializeAuthenticationResult = (res: AuthenticationResult): SerializAuthenticationResult => ({
  ...res,
  expiresOn: new Date(res.expiresOn).getTime(),
  extExpiresOn: new Date(res.extExpiresOn).getTime(),
});

/**
 * 登录/获取 token
 * https://developer.chrome.com/docs/apps/app_identity/#non
 */
export const msalAuthentication = (request: RedirectRequest): Promise<SerializAuthenticationResult> => {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url: string) => {
      // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (hashUrl) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);

        msalInstance.handleRedirectPromise(hashUrl).then(resolve).catch(reject);
      });
    };

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/pull/2669
    // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-core/classes/_useragentapplication_.useragentapplication.html#acquiretokenredirect
    msalInstance.acquireTokenRedirect({ onRedirectNavigate, ...request }).catch(reject);

    // const accountInfo = msalInstance.getAllAccounts();
    // logger.log('getActiveAccount', accountInfo)
    // msalInstance.acquireTokenSilent({
    //   ...request,
    //   account: accountInfo[0]
    // })
    //   .then(resolve)
    //   .catch(err => {
    //     logger.warn('acquireTokenSilent error try acquireTokenRedirect', err)
    //     msalInstance.acquireTokenRedirect({ onRedirectNavigate, ...request }).catch(reject);
    //   })
  })
    .then(serializeAuthenticationResult)
    .catch((e) => {
      clearAccount();
      return Promise.reject(e);
    });
};

export const msalAcquireTokenSilent = (request: SilentRequest) => msalInstance.acquireTokenSilent(request).then(serializeAuthenticationResult);
