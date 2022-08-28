/**
 * see
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-browser-samples/ChromiumExtensionSample
 * https://github.com/MicrosoftDocs/azure-docs/issues/62164
 */

import { AuthenticationResult, Configuration, PublicClientApplication, RedirectRequest } from '@azure/msal-browser';
import { SerializAuthenticationResult } from '../../types';
import { MSAL_CLIENT_ID } from '../constants';
import { ErrorCode } from '../constants/enums';
import AppError from './error';
import { logger } from './logger';

const DEFAULT_MSAL_CONF: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: chrome.identity.getRedirectURL(), // see: https://developer.chrome.com/docs/extensions/reference/identity/#method-getRedirectURL
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};
const msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);

const serializeAuthenticationResult = (res: AuthenticationResult): SerializAuthenticationResult => ({
  ...res,
  expiresOn: new Date(res.expiresOn).getTime(),
  extExpiresOn: new Date(res.extExpiresOn).getTime(),
});

/**
 * 清空登录态
 */
const clearAccount = () => {
  logger.warn('clear account');
  chrome.storage.sync.clear();
};

async function getLoginUrl(request?: RedirectRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    msalInstance
      .loginRedirect({
        ...request,
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch((e) => {
        clearAccount();
        reject(new AppError({ code: ErrorCode.LOGIN_REDIRECT, message: e }));
      });
  });
}

/**
 * Generates an acquire token url
 */
async function getAcquireTokenUrl(request: RedirectRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    msalInstance
      .acquireTokenRedirect({
        ...request,
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch((e) => {
        clearAccount();
        reject(new AppError({ code: ErrorCode.ACQUIRE_TOKEN_REDIRECT, message: e }));
      });
  });
}

/**
 * Generates a login url
 */
async function launchWebAuthFlow(url: string, type: string): Promise<SerializAuthenticationResult | void> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url,
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          clearAccount();
          reject(new AppError({ code: ErrorCode.LAUNCH_WEB_AUTH_FLOW, message: `type: ${type} ${chrome.runtime.lastError.message}` }));
        }

        if (responseUrl && responseUrl.includes('#')) {
          msalInstance
            .handleRedirectPromise(`#${responseUrl.split('#')[1]}`)
            .then((res) => resolve(serializeAuthenticationResult(res)))
            .catch((e) => reject(new AppError({ code: ErrorCode.HANDLE_REDIRECT_PROMISE, message: `type: ${type} ${e}` })));
        } else {
          // Logout calls
          resolve();
        }
      }
    );
  });
}

/**
 * Generates a logout url
 */
async function getLogoutUrl(request?: RedirectRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    msalInstance
      .logoutRedirect({
        ...request,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch((e) => {
        reject(new AppError({ code: ErrorCode.LOGOUT_REDIRECT, message: e }));
      });
  });
}

export const msalGetAllAccounts = () => msalInstance.getAllAccounts();

export const msalLogin = async () => {
  const loginUrl = await getLoginUrl();
  return launchWebAuthFlow(loginUrl, 'login') as Promise<SerializAuthenticationResult>;
};

export const msalAcquireToken = (request: RedirectRequest, silen: boolean) => {
  return msalInstance
    .acquireTokenSilent(request)
    .then((res) => serializeAuthenticationResult(res))
    .catch(async (error) => {
      if (silen) throw new AppError({ code: ErrorCode.ACQUIRE_TOKEN_SILENT, message: `acquireTokenSilent: silen ${silen}\n error: ${error}` });
      const acquireTokenUrl = await getAcquireTokenUrl(request);
      return launchWebAuthFlow(acquireTokenUrl, 'acquireToke') as Promise<SerializAuthenticationResult>;
    });
};

export const msalLogout = async () => {
  const logoutUrl = await getLogoutUrl();
  return launchWebAuthFlow(logoutUrl, 'logout') as Promise<void>;
};
