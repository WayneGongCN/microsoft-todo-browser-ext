// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

module.exports = {
  manifest_version: 3,
  version: packageJson.version,
  name: '__MSG_extensionName__',
  description: '__MSG_extensionDescription__',
  default_locale: 'en',

  permissions: ['identity', 'tabs', 'notifications', 'storage'],

  options_page: 'options.html',
  action: {
    default_popup: 'popup.html',
  },
  background: {
    service_worker: 'background.js'
  },

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
    },
  ],

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
