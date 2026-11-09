import { defineBackground } from 'wxt/utils/define-background';
import { trackAnalytics } from '../core/analytics';
import type { AnalyticsSurface } from '../core/analytics';
import { makeCapture, pendingCaptureKey } from '../core/capture';
import { publicError } from '../core/errors';
import { handle, initialize, parseRequest } from '../core/service';

/** 只信任本扩展预期的顶层界面，网页脚本不能调用认证或 Graph 操作，喵~ */
function senderSurface(sender: chrome.runtime.MessageSender): AnalyticsSurface | undefined {
  if (sender.id !== chrome.runtime.id || !sender.url) return;
  const url = new URL(sender.url);
  if (url.protocol !== 'chrome-extension:' || url.hostname !== chrome.runtime.id) return;
  if (url.pathname === '/popup.html') return 'popup';
  if (url.pathname === '/options.html') return 'options';
}

/** 冻结右键来源并打开工具栏弹窗，无法自动打开时用角标提示，喵~ */
async function openCapture(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): Promise<void> {
  if (tab?.id === undefined) return;
  const kind = info.menuItemId === 'selection' ? 'selection' : info.menuItemId === 'link' ? 'link' : 'page';
  const capture = makeCapture(kind, {
    title: tab.title,
    url: info.pageUrl ?? tab.url,
    text: info.selectionText,
    linkUrl: info.linkUrl,
  });
  await chrome.storage.session.set({ [pendingCaptureKey(tab.id)]: capture });
  try {
    await chrome.action.openPopup({ windowId: tab.windowId });
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '1' });
  }
}

/** 安装和更新时注册菜单，所有名称随扩展一起交付，喵~ */
async function registerMenus(): Promise<void> {
  await chrome.contextMenus.removeAll();
  for (const kind of ['page', 'selection', 'link'] as const) {
    chrome.contextMenus.create({ id: kind, title: chrome.i18n.getMessage(`menu_${kind}`), contexts: [kind] });
  }
}

export default defineBackground(() => {
  const ready = initialize();
  chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
    const surface = senderSurface(sender);
    if (!surface) return;
    void ready
      .then(async () => {
        const request = parseRequest(message);
        if (request.type === 'analytics_open') {
          void trackAnalytics({ name: 'extension_open', surface });
          return;
        }
        const result = await handle(request);
        if (request.type === 'login' || request.type === 'logout') {
          const accountId = (result as { accountId: string }).accountId;
          void chrome.runtime.sendMessage({ type: 'session_changed', accountId }).catch(() => undefined);
        }
        return result;
      })
      .then(
        (data) => respond({ ok: true, data }),
        (error) => respond({ ok: false, error: publicError(error) }),
      );
    return true;
  });
  chrome.runtime.onInstalled.addListener(() => {
    void ready.then(registerMenus).catch(() => undefined);
  });
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    void ready
      .then(() => openCapture(info, tab))
      .catch(() => {
        if (tab?.id !== undefined)
          void chrome.action.setBadgeText({ tabId: tab.id, text: '!' }).catch(() => undefined);
      });
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    void chrome.storage.session.remove(pendingCaptureKey(tabId)).catch(() => undefined);
  });
});
