import { PublicClientApplication } from '@azure/msal-browser';

const DEFAULT_MSAL_CONF = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: `https://${chrome.runtime.id}.chromiumapp.org/`,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);

const clearAccount = () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
};

// https://developer.chrome.com/docs/apps/app_identity/#non
const originAcquireTokenRedirect = msalInstance.acquireTokenRedirect;
msalInstance.acquireTokenRedirect = function acquireTokenRedirect(options, ...args) {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (hashUrl) => {
        if (chrome.runtime.lastError) {
          clearAccount();
          return reject(chrome.runtime.lastError.message);
        }
        return msalInstance.handleRedirectPromise(hashUrl)
          .then(resolve)
          .catch((e) => {
            clearAccount();
            reject(e);
          });
      });
    };

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/pull/2669
    // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-core/classes/_useragentapplication_.useragentapplication.html#acquiretokenredirect
    originAcquireTokenRedirect.call(msalInstance, { onRedirectNavigate, ...options }, ...args).catch((e) => {
      clearAccount();
      reject(e);
    });
  });
};

const originLogout = msalInstance.logout;
msalInstance.logout = function logout(options, ...args) {
  return new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, () => {
        clearAccount();
        // user allways close window
        // if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
        resolve();
      });
    };

    originLogout.call(msalInstance, { onRedirectNavigate, ...options }, ...args).catch(reject);
  });
};

export default msalInstance;
