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
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-core/classes/_useragentapplication_.useragentapplication.html#acquiretokenredirect
  // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
  // https://developer.chrome.com/docs/apps/app_identity/#non
  // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
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

export default msalInstance;
