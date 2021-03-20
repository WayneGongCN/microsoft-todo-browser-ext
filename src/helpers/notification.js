/* eslint-disable no-underscore-dangle */
const defaultIconUrl = `chrome-extension://${chrome.runtime.id}/icons/todo-128.png`;
const defaultType = 'basic';

const onClickCallbackMap = {};
const onClosedCallbackMap = {};

chrome.notifications.onClicked.addListener((notificationId) => {
  const callback = onClickCallbackMap[notificationId];
  if (!callback || typeof callback !== 'function') return;
  callback();
});
chrome.notifications.onClosed.addListener((notificationId) => {
  const callback = onClosedCallbackMap[notificationId];
  if (!callback || typeof callback !== 'function') return;
  callback();
});


export default class Notify {
  constructor(title, message, options) {
    this.notificationId = `${Date.now()}-${Math.random()}`;
    this._options = title && message && options;
    this._options = {
      title,
      message,
      type: defaultType,
      iconUrl: defaultIconUrl,
      ...options,
    };
  }

  _registerCallback() {
    if (this._onClickCallback) onClickCallbackMap[this.notificationId] = this._onClickCallback.bind(this);
    if (this._onClosedCallback) onClosedCallbackMap[this.notificationId] = this._onClosedCallback.bind(this);
  }

  create() {
    return new Promise((resolve, reject) => {
      chrome.notifications.create(this.notificationId, this._options, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        this._registerCallback();
        return resolve(this);
      });
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      chrome.notifications.clear(this.notificationId, (wasCleared) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        return resolve(wasCleared);
      });
    });
  }

  onClick(fn) {
    if (!fn || typeof fn !== 'function') throw new TypeError('fn required function.');
    this._onClickCallback = fn;
    this._registerCallback();
  }

  onClosed(fn) {
    if (!fn || typeof fn !== 'function') throw new TypeError('fn required function.');
    this._onClosedCallback = fn;
    this._registerCallback();
  }
}
