import { read, remove, Transactions, write } from './storage';

export const ANALYTICS_CLIENT_KEY = 'v2:analytics-client-id';
const sessionKey = 'v2:analytics-session';
const endpoint =
  import.meta.env.MODE === 'production'
    ? 'https://microsoft-todo-capture-site.vercel.app/api/extension-analytics/'
    : (import.meta.env.WXT_ANALYTICS_ENDPOINT as string | undefined);
const transactions = new Transactions();
type Session = { id: number; lastEventAt: number };
export type AnalyticsSurface = 'popup' | 'options';

/** 只在主动同意后生成统计标识，撤回时同时清理会话。 */
export async function setAnalyticsConsent(enabled: boolean): Promise<boolean> {
  return transactions.run(async () => {
    if (enabled) {
      if (!(await read<string>(ANALYTICS_CLIENT_KEY))) {
        const clientId = Array.from(crypto.getRandomValues(new Uint32Array(2)), (part) => part + 1).join('.');
        await write({ [ANALYTICS_CLIENT_KEY]: clientId });
      }
    } else {
      await remove([ANALYTICS_CLIENT_KEY]);
      await chrome.storage.session.remove(sessionKey);
    }
    return enabled;
  });
}

/** 统计走独立的请求，失败时保留原来的界面和任务结果。 */
export async function trackAnalytics(
  event: { name: 'extension_open'; surface: AnalyticsSurface } | { name: 'task_created' },
): Promise<void> {
  if (!endpoint) return;
  try {
    const payload = await transactions.run(async () => {
      const clientId = await read<string>(ANALYTICS_CLIENT_KEY);
      if (!clientId) return;
      const previous = (await chrome.storage.session.get(sessionKey))[sessionKey] as Session | undefined;
      const now = Date.now();
      const sessionId =
        previous && now - previous.lastEventAt < 30 * 60_000 ? previous.id : Math.floor(now / 1000);
      await chrome.storage.session.set({ [sessionKey]: { id: sessionId, lastEventAt: now } });
      return {
        clientId,
        sessionId,
        version: chrome.runtime.getManifest().version,
        event: event.name,
        ...('surface' in event ? { surface: event.surface } : {}),
      };
    });
    if (!payload) return;
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
      signal: AbortSignal.timeout(4500),
    });
  } catch {
    // 统计不可用时不阻塞正常操作。
  }
}
