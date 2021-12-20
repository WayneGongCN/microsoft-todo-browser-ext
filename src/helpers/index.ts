import Task from "../classes/Task";
import Tasklist from "../classes/TaskList";
import Notify from "./notification";

export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";

export const bindAsyncActions = (
  slice: any,
  asyncActioMap: Record<string, Function>
) => {
  Object.keys(asyncActioMap).forEach((key) => {
    slice[key] = asyncActioMap[key];
  });
};

export const openMicrosoftTodo = (target?: Task | Tasklist) =>
  new Promise((resolve, reject) => {
    const prefix = "https://to-do.live.com";

    let url = "";
    if (target instanceof Task) {
      url = `${prefix}/tasks/id/${target.id}/details`;
    } else if (target instanceof Tasklist) {
      url = `${prefix}/tasks/${target.id}`;
    } else {
      url = `${prefix}/tasks/inbox`;
    }

    chrome.tabs.create({ active: true, url }, (tab) => {
      if (chrome.runtime.lastError)
        return reject(chrome.runtime.lastError.message);
      return resolve(tab);
    });
  });

export const getActiveTab = (): Promise<chrome.tabs.Tab> =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (tabs) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
      else if (tabs && tabs.length > 0) {
        const firstActiveTab = tabs[0];
        resolve(firstActiveTab);
      } else {
        reject(new Error("Not found active tab."));
      }
    });
  });


export const sendMessageToActiveTab = (msg: chrome.tabs.MessageSendOptions): Promise<chrome.tabs.Tab> => {
  return getActiveTab()
    .then((tab) => {
      chrome.tabs.sendMessage(tab.id, msg)
      return tab;
    });
}


export const showTaskNotify = (
  task: Task,
  title = "Create task success",
  message = "Open Microsoft To-Do."
) => {
  const notify = new Notify({ title, message })
  notify.onClick(() => {
    openMicrosoftTodo(task);
    notify.clear();
  });
  return notify
};
