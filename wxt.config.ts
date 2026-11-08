import { defineConfig } from 'wxt';
import developmentIdentity from './config/development-identity.json';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  imports: false,
  manifest: ({ mode }) => ({
    name: mode === 'production' ? '__MSG_extensionName__' : '__MSG_extensionName__ · Dev',
    description: '__MSG_extensionDescription__',
    minimum_chrome_version: '123',
    default_locale: 'en',
    permissions: ['identity', 'storage', 'activeTab', 'scripting', 'contextMenus'],
    host_permissions: ['https://login.microsoftonline.com/*', 'https://graph.microsoft.com/*'],
    icons: {
      16: 'icons/todo-16.png',
      32: 'icons/todo-32.png',
      48: 'icons/todo-48.png',
      128: 'icons/todo-128.png',
    },
    ...(mode !== 'production' ? { key: developmentIdentity.key } : {}),
  }),
});
