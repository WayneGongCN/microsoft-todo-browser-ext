import { store } from "../redux";
import { getActiveTab, sendMessageToActiveTab } from "../helpers";
import { ENABLE_QUICK_ADD } from "../constants";
import { createTask } from "../redux/task";

export const QUICK_ADD_MENU_ITEMS = [
  {
    id: "QUICK_ADD",
    title: "Quick add task...",
    contexts: ["all"],
  },
];

// export const quickAddTask = (taskMeta: any) => {
//   return fetchTasklists()(store.dispatch)
//     .then((tasklistList) => tasklistList[0]?.id)
//     .then(
//       (tasklistId) =>
//         tasklistId &&
//         createTask(tasklistId, taskMeta, true)(store.dispatch, store.getState)
//     );
// };

// export const handleQuickAddMenuItemEvent = (
//   info: chrome.contextMenus.OnClickData
// ) => {
//   if (info.menuItemId !== QUICK_ADD_MENU_ITEM.id) return Promise.resolve(null);

//   return getActiveTab()
//     .then((activeTab) => {
//       const describe = info.selectionText;
//       let title = info.selectionText || activeTab.title;
//       title = title.length > 130 ? `${title.slice(0, 130)}...` : title;

//       const taskMeta = {
//         title,
//         describe,
//         contentType: "text",
//         timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
//         importance: false,
//         bookmarked: true,
//       };

//       sendMessageToActiveTab({ type: "CURSOR_LOADING" });
//       return quickCreateTask(taskMeta).finally(() => {
//         sendMessageToActiveTab({ type: "CURSOR_RESET" });
//       });
//     })
//     .catch((e) => showNotify("Error", e.message));
// };

chrome.contextMenus.removeAll(() => {
  if (!ENABLE_QUICK_ADD) return;
  QUICK_ADD_MENU_ITEMS.forEach((item) => {
    chrome.contextMenus.create(item, () => {
      if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info, tab);
    const { menuItemId, selectionText } = info;

    store.dispatch(createTask({}))
    .then(res => {

    })
  });
});
