/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import msalInstance from './helpers/msal';
import { store } from './reducers';
import { QUICK_ADD_MENU_ITEM, handleQuickAddMenuItemEvent } from './menus/quickAdd';


console.log(msalInstance)
console.log(store)


chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create(
    QUICK_ADD_MENU_ITEM,
    () => {
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
    },
  );
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleQuickAddMenuItemEvent(info);
});
