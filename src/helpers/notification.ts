import { v4 as uuidv4 } from "uuid";
import { NOTIFICATION_ICON_URL, NOTIFICATION_TYPE } from "../constants";


const clickCallbackMap = new Map<string, [() => void]>();
const closeCallbackMap =  new Map<string, [() => void]>();

chrome.notifications.onClicked.addListener((id) => {
  const callback = clickCallbackMap.get(id);
  Array.isArray(callback) && callback.forEach(x => x())
});

chrome.notifications.onClosed.addListener((id) => {
  const callback = closeCallbackMap.get(id);
  Array.isArray(callback) && callback.forEach(x => x())
});

const addCallback = (map: Map<string, [() => void]>) => (cb: () => void) => (id: string) => {
  const cbList = map.get(id) || [] as unknown as [() => void];
  cbList.push(cb);
  map.set(id, cbList)
}


export default class Notify {
  id: string;
  options: chrome.notifications.NotificationOptions;

  constructor(
    options: chrome.notifications.NotificationOptions
  ) {
    this.id = uuidv4();
    this.options = {
      type: NOTIFICATION_TYPE,
      iconUrl: NOTIFICATION_ICON_URL,
      ...options,
    };
  }


  show() {
    return new Promise((resolve, reject) => {
      chrome.notifications.create(this.id, this.options, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        return resolve(this);
      });
    });
  }


  clear() {
    return new Promise((resolve, reject) => {
      chrome.notifications.clear(this.id, (wasCleared) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
        return resolve(wasCleared);
      });
    });
  }


  onClick(cb: () => void) {
    addCallback(clickCallbackMap)(cb)(this.id)
    return this
  }


  onClosed(cb: () => void) {
    addCallback(closeCallbackMap)(cb)(this.id)
    return this
  }
}
