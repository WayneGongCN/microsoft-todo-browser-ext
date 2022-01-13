// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

module.exports = {
  manifest_version: 2,
  name: 'Microsoft To Do browser extension',
  default_locale: 'en',
  version: packageJson.version,
  description: packageJson.description,
  permissions: ['identity', 'tabs', 'contextMenus', 'notifications', 'storage'],
  background: {
    scripts: ['background.js'],
    persistent: false,
  },
  // options_page: 'options.html',
  browser_action: {
    default_popup: 'popup.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
    },
  ],
  "content_security_policy": "script-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; object-src 'self'",
  icons:
    process.env.NODE_ENV === 'development'
      ? { 128: './icons/todo-dev-128.png' }
      : {
          16: './icons/todo-16.png',
          24: './icons/todo-24.png',
          32: './icons/todo-32.png',
          48: './icons/todo-48.png',
          128: './icons/todo-128.png',
        },
};
