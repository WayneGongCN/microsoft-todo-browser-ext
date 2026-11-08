import { accessToken } from './auth';
import { AppError } from './errors';

const GRAPH = 'https://graph.microsoft.com/v1.0';
export interface TodoList {
  id: string;
  displayName: string;
  wellknownListName?: string;
  isOwner?: boolean;
  isShared?: boolean;
}
export interface TaskInput {
  title: string;
  body?: { contentType: 'text'; content: string };
  importance?: 'normal' | 'high';
  linkedResources?: { webUrl: string; applicationName: string; displayName: string }[];
  isReminderOn?: boolean;
  reminderDateTime?: { dateTime: string; timeZone: string };
}
export interface CreatedTask {
  id: string;
  title: string;
}

/** 只允许微软 Graph 的 v1.0 请求及其分页地址，喵~ */
export function graphUrl(path: string): URL {
  const url = new URL(path, `${GRAPH}/`);
  if (
    url.origin !== 'https://graph.microsoft.com' ||
    !url.pathname.startsWith('/v1.0/') ||
    url.username ||
    url.password
  )
    throw new AppError('invalid');
  return url;
}

/** 统一处理 Graph 授权、节流和不确定的写入结果，不自动重放含糊失败的 POST，喵~ */
async function request<T>(
  accountId: string,
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  const url = graphUrl(path);
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await accessToken(accountId, attempt === 1);
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new AppError(method === 'POST' ? 'unknown' : 'network');
    }
    if (response.status === 401 && attempt === 0) continue;
    if (response.status === 401) throw new AppError('auth_required');
    if (response.status === 403) throw new AppError('forbidden');
    if (response.status === 404) throw new AppError('not_found');
    if (response.status === 429)
      throw new AppError('rate_limited', undefined, Number(response.headers.get('Retry-After')) || 60);
    if (!response.ok)
      throw new AppError(
        method === 'POST' && response.status >= 500 ? 'unknown' : 'invalid',
        String(response.status),
      );
    if (response.status === 204) return undefined as T;
    try {
      return (await response.json()) as T;
    } catch {
      throw new AppError(method === 'POST' ? 'unknown' : 'network');
    }
  }
  throw new AppError('auth_required');
}

/** 遍历完整清单分页，检测循环分页并限制异常响应，喵~ */
export async function getLists(accountId: string): Promise<TodoList[]> {
  let next: string | undefined = 'me/todo/lists?$top=100';
  const seen = new Set<string>();
  const lists: TodoList[] = [];
  while (next) {
    if (seen.has(next) || seen.size >= 100) throw new AppError('invalid');
    seen.add(next);
    const page: { value: TodoList[]; '@odata.nextLink'?: string } = await request(accountId, next);
    if (
      !Array.isArray(page.value) ||
      page.value.some((list) => typeof list.id !== 'string' || typeof list.displayName !== 'string')
    )
      throw new AppError('invalid');
    lists.push(...page.value);
    next = page['@odata.nextLink'];
  }
  return lists;
}

/** 创建一个任务，只有收到有效任务标识才确认成功，喵~ */
export async function createTask(accountId: string, listId: string, input: TaskInput): Promise<CreatedTask> {
  const result = await request<CreatedTask>(
    accountId,
    `me/todo/lists/${encodeURIComponent(listId)}/tasks`,
    'POST',
    input,
  );
  if (!result || typeof result.id !== 'string') throw new AppError('unknown');
  return result;
}

/** 读取已创建的任务，供真实服务联调核对字段，喵~ */
export async function readTask(
  accountId: string,
  listId: string,
  taskId: string,
): Promise<TaskInput & CreatedTask> {
  return request(
    accountId,
    `me/todo/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}?$expand=linkedResources`,
  );
}
