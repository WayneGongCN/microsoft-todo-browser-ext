/* eslint-disable no-underscore-dangle */
const defaultIconUrl = `chrome-extension://${chrome.runtime.id}/icons/todo-128.png`;
const defaultType = 'basic';

const onClickCallbackMap: {[key: string]: Function} = {};
const onClosedCallbackMap: {[key: string]: Function} = {};


chrome.notifications.onClicked.addListener((notificationId) => {
  const callback = onClickCallbackMap[notificationId];
  callback();
});
chrome.notifications.onClosed.addListener((notificationId) => {
  const callback = onClosedCallbackMap[notificationId];
  callback();
});


export default class Notify {
  notificationId: string
  _options: chrome.notifications.NotificationOptions
  _onClickCallback: Function
  _onClosedCallback: Function

  constructor(title: string, message: string, options?: chrome.notifications.NotificationOptions) {
    this.notificationId = `${Date.now()}-${Math.random()}`;
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

  onClick(fn: Function) {
    this._onClickCallback = fn;
    this._registerCallback();
  }

  onClosed(fn: Function) {
    this._onClosedCallback = fn;
    this._registerCallback();
  }
}
