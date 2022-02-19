// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

module.exports = {
  // version
  manifest_version: 2,
  version: packageJson.version,

  // 基本信息
  name: '__MSG_extensionName__',
  description: '__MSG_extensionDescription__',
  default_locale: 'en',

  // 权限
  permissions: ['identity', 'tabs', 'contextMenus', 'notifications', 'storage'],
  "content_security_policy": "script-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; object-src 'self'",

  // background
  background: {
    scripts: ['background.js'],
    persistent: false,
  },

  // options
  options_page: 'options.html',

  // popup
  browser_action: {
    default_popup: 'popup.html',
  },

  // content
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
    },
  ],

  // 图片资源
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
