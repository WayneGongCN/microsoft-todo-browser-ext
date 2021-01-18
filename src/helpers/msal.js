import { PublicClientApplication } from '@azure/msal-browser';

const DEFAULT_MSAL_CONF = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: `https://${process.env.CHROME_EXT_ID}.chromiumapp.org/`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(DEFAULT_MSAL_CONF);

['acquireTokenRedirect', 'logout'].forEach((fnName) => {
  const originFn = msalInstance[fnName];
  // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/2664
  // https://developer.chrome.com/docs/apps/app_identity/#non
  // https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
  const promisifyFn = (request, ...args) => new Promise((resolve, reject) => {
    const onRedirectNavigate = (url) => {
      chrome.identity.launchWebAuthFlow({ url, interactive: true }, (hashUrl) => {
        if (fnName === 'acquireTokenRedirect')msalInstance.handleRedirectPromise(hashUrl).then(resolve).catch(reject);
        else resolve();
      });
    };
    originFn.call(msalInstance, { onRedirectNavigate, ...request }, ...args);
  });
  msalInstance[fnName] = promisifyFn;
});

msalInstance.getToken = function getToken(options) {
  // return this.acquireTokenSilent(options)
  //   .catch(() => this.acquireTokenRedirect(options));
  return this.acquireTokenRedirect(options);
};

export default msalInstance;
