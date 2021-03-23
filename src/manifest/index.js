const packageJson = require('../../package.json');

module.exports = {
  name: 'Microsoft To Do browser extension',
  version: packageJson.version,
  description: packageJson.description,
  permissions: ['identity', 'tabs', 'contextMenus', 'notifications'],
  background: {
    scripts: ['background.js'],
    persistent: false,
  },
  options_page: 'options.html',
  browser_action: {
    default_popup: 'popup.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
    },
  ],
  icons: {
    16: './icons/todo-16.png',
    24: './icons/todo-24.png',
    32: './icons/todo-32.png',
    48: './icons/todo-48.png',
    128: './icons/todo-128.png',
  },
  manifest_version: 2,
};
