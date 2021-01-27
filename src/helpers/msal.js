import { PublicClientApplication } from '@azure/msal-browser';
import { extensionId } from '.';

const DEFAULT_MSAL_CONF = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: `https://${extensionId}.chromiumapp.org/`,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);

['acquireTokenRedirect', 'logout'].forEach((fnName) => {
  const originFn = msalInstance[fnName];
  const promisifyFn = (request, ...args) => new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (hashUrl) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        if (fnName === 'acquireTokenRedirect') return msalInstance.handleRedirectPromise(hashUrl).then(resolve).catch(reject);
        return resolve();
      });
    };

    originFn.call(msalInstance, { onRedirectNavigate, ...request }, ...args).catch(reject);
  });

  msalInstance[fnName] = promisifyFn;
});

// https://developer.chrome.com/docs/apps/app_identity/#non
const originAcquireTokenRedirect = msalInstance.acquireTokenRedirect;
msalInstance.acquireTokenRedirect = function acquireTokenRedirect(options, ...args) {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (hashUrl) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        return msalInstance.handleRedirectPromise(hashUrl).then(resolve).catch(reject);
      });
    };

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/pull/2669
    // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-core/classes/_useragentapplication_.useragentapplication.html#acquiretokenredirect
    originAcquireTokenRedirect.call(msalInstance, { onRedirectNavigate, ...options }, ...args).catch(reject);
  });
};

const originLogout = msalInstance.logout;
msalInstance.logout = function logout(options, ...args) {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, () => {
        window.localStorage.clear();
        window.sessionStorage.clear();

        // user allways close window
        // if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
        resolve();
      });
    };

    originLogout.call(msalInstance, { onRedirectNavigate, ...options }, ...args).catch(reject);
  });
};

export default msalInstance;
