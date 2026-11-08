import type { Capture } from './model';
import { safeSource } from './model';

/** 将网页或右键上下文转换为编辑草稿，选区全文保留在备注中，喵~ */
export function makeCapture(
  kind: 'page' | 'selection' | 'link',
  data: { title?: string; url?: string; text?: string; linkUrl?: string },
): Capture {
  const source = safeSource(
    kind === 'link' ? data.linkUrl : data.url,
    kind === 'link' ? data.linkUrl : data.title,
  );
  const text = data.text?.trim() ?? '';
  const title =
    kind === 'selection' && text
      ? text.split(/\r?\n/)[0]!.slice(0, 255)
      : kind === 'link'
        ? (source?.url.slice(0, 255) ?? '')
        : (data.title ?? '').slice(0, 255);
  return { title, note: kind === 'selection' ? text : '', ...(source ? { source } : {}) };
}

/** 工具栏只读取当前窗口的活动页，并在用户授权后按需取得选区，喵~ */
export async function captureActivePage(): Promise<Capture | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !safeSource(tab.url)) return;
  let text = '';
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() ?? '',
    });
    if (typeof result?.result === 'string') text = result.result;
  } catch {
    /* 受限网页仍可收集其可见标题和网址，喵~ */
  }
  return makeCapture(text ? 'selection' : 'page', { title: tab.title, url: tab.url, text });
}
