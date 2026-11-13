import { read, remove, Transactions, write } from './storage';

export const ANALYTICS_ENABLED_KEY = 'v2:analytics-enabled';
const legacyClientKey = 'v2:analytics-client-id';
const legacySessionKey = 'v2:analytics-session';
const endpoint =
  import.meta.env.MODE === 'production'
    ? 'https://microsoft-todo-capture-site.vercel.app/api/extension-analytics/'
    : (import.meta.env.WXT_ANALYTICS_ENDPOINT as string | undefined);
const transactions = new Transactions();
export type AnalyticsSurface = 'popup' | 'options';

/** 迁移旧 Chrome 开关并清理本机统计标识，Edge 首次提供开关时默认开启，喵~ */
export async function initializeAnalytics(previouslyInitialized: boolean): Promise<void> {
  if ((await read(ANALYTICS_ENABLED_KEY)) === undefined) {
    const enabled =
      Boolean(import.meta.env.EDGE) ||
      !previouslyInitialized ||
      typeof (await read(legacyClientKey)) === 'string';
    await write({ [ANALYTICS_ENABLED_KEY]: enabled });
  }
  await remove([legacyClientKey]);
  await chrome.storage.session.remove(legacySessionKey);
}

/** 新安装默认统计，保存的关闭偏好优先，喵~ */
export async function analyticsEnabled(): Promise<boolean> {
  return (await read<boolean>(ANALYTICS_ENABLED_KEY)) !== false;
}

/** 将用户选择保存到本机，与事件发送串行确认，喵~ */
export async function setAnalyticsConsent(enabled: boolean): Promise<boolean> {
  return transactions.run(async () => {
    await write({ [ANALYTICS_ENABLED_KEY]: enabled });
    return enabled;
  });
}

/** 仅发送固定事件和扩展版本，网络失败不阻塞任务操作，喵~ */
export async function trackAnalytics(
  event: { name: 'extension_open'; surface: AnalyticsSurface } | { name: 'task_created' },
): Promise<void> {
  if (!endpoint) return;
  try {
    const result = await transactions.run(async () => {
      if (!(await analyticsEnabled())) return;
      const payload = {
        version: chrome.runtime.getManifest().version,
        event: event.name,
        ...('surface' in event ? { surface: event.surface } : {}),
      };
      const delivery = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        signal: AbortSignal.timeout(4500),
      }).catch(() => undefined);
      return { delivery };
    });
    await result?.delivery;
  } catch {
    // 统计不可用时不阻塞正常操作，喵~
  }
}
