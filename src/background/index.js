/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import msalInstance from '../helpers/msal';
window.msalInstance = msalInstance;

import { Task, Tasklist } from '../models/Task';
window.Task = Task;
window.Tasklist = Tasklist;

import getStore from '../reducers';
window.getStore = getStore;

chrome.contextMenus.create(
  {
    id: 'QUICK_ADD',
    title: 'Quick add task',
    contexts: ['page', 'selection', 'link', 'image'],
  },
  () => {
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message);
    }
  },
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const {
    editable,
    frameId,
    mediaType,
    menuItemId,
    pageUrl,
    selectionText,
    srcUrl,
  } = info;
  const {
    active,
    audible,
    autoDiscardable,
    discarded,
    favIconUrl,
    groupId,
    height,
    highlighted,
    id,
    incognito,
    index,
    mutedInfo,
    openerTabId,
    pinned,
    selected,
    status,
    title,
    url,
    width,
    windowId,
  } = tab;
});
