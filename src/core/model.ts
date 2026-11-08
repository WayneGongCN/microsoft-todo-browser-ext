import { AppError } from './errors';
import type { TaskInput } from './graph';

export interface Source {
  title: string;
  url: string;
}
export interface Capture {
  title: string;
  note: string;
  source?: Source;
}
export interface Fields {
  title: string;
  note: string;
  listId: string;
  important: boolean;
  reminder: string;
  source?: Source;
}
export interface Draft extends Fields {
  id: string;
  revision: number;
  updatedAt: number;
}
export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  language: 'system' | 'en' | 'zh_CN';
  attachSource: boolean;
  listMode: 'recent' | 'fixed';
  defaultListId: string;
}
export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  language: 'system',
  attachSource: true,
  listMode: 'recent',
  defaultListId: '',
};
export interface Receipt {
  id: string;
  draftId: string;
  revision: number;
  accountId: string;
  status: 'sending' | 'succeeded' | 'failed' | 'unknown';
  createdAt: number;
  workerId: string;
  taskId?: string;
  resolution?: 'confirmed_present' | 'confirmed_absent';
  error?: { code: string; detail?: string; retryAfter?: number };
}

/** 只接受可预览的普通网页地址，拒绝凭据地址和可执行协议，喵~ */
export function safeSource(url: unknown, title: unknown = ''): Source | undefined {
  if (typeof url !== 'string' || url.length > 8192) return;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return;
    return { url: parsed.href, title: typeof title === 'string' ? title.slice(0, 512) : parsed.hostname };
  } catch {
    return;
  }
}

/** 校验跨上下文的草稿字段，保留原始文字并限制本地与远端负载，喵~ */
export function parseFields(value: unknown): Fields {
  if (!value || typeof value !== 'object') throw new AppError('invalid');
  const input = value as Record<string, unknown>;
  for (const [name, maximum] of [
    ['title', 255],
    ['note', 20_000],
    ['listId', 1024],
    ['reminder', 32],
  ] as const) {
    if (typeof input[name] !== 'string' || input[name].length > maximum) throw new AppError('invalid');
  }
  if (typeof input.important !== 'boolean') throw new AppError('invalid');
  let source: Source | undefined;
  if (input.source !== undefined) {
    if (!input.source || typeof input.source !== 'object') throw new AppError('invalid');
    const raw = input.source as Record<string, unknown>;
    source = safeSource(raw.url, raw.title);
    if (!source) throw new AppError('invalid');
  }
  return {
    title: input.title as string,
    note: input.note as string,
    listId: input.listId as string,
    reminder: input.reminder as string,
    important: input.important,
    ...(source ? { source } : {}),
  };
}

/** 创建独立草稿标识，新捕获不会沿用旧提交的身份，喵~ */
export function emptyDraft(listId = '', capture?: Capture): Draft {
  return {
    id: crypto.randomUUID(),
    revision: 0,
    updatedAt: Date.now(),
    title: capture?.title ?? '',
    note: capture?.note ?? '',
    listId,
    important: false,
    reminder: '',
    ...(capture?.source ? { source: capture.source } : {}),
  };
}

/** 判断是否有需要保护的用户输入，目标清单本身不算未提交内容，喵~ */
export function hasContent(draft: Fields): boolean {
  return Boolean(
    draft.title.trim() || draft.note.trim() || draft.source || draft.important || draft.reminder,
  );
}

/** 将用户本地提醒时间转换为明确 UTC，拒绝无效时间和已过期提醒，喵~ */
export function taskInput(fields: Fields, now = Date.now()): TaskInput {
  const parsed = parseFields(fields);
  if (!parsed.title.trim() || !parsed.listId) throw new AppError('invalid');
  const task: TaskInput = {
    title: parsed.title.trim(),
    body: { contentType: 'text', content: parsed.note },
    importance: parsed.important ? 'high' : 'normal',
  };
  if (parsed.source)
    task.linkedResources = [
      {
        webUrl: parsed.source.url,
        applicationName: 'To Do Capture',
        displayName: parsed.source.title || new URL(parsed.source.url).hostname,
      },
    ];
  if (parsed.reminder) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(parsed.reminder)) throw new AppError('invalid', 'reminder');
    const date = new Date(parsed.reminder);
    const local =
      [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-') +
      `T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (!Number.isFinite(date.getTime()) || date.getTime() <= now || local !== parsed.reminder)
      throw new AppError('invalid', 'reminder');
    task.isReminderOn = true;
    task.reminderDateTime = { dateTime: date.toISOString().slice(0, -1), timeZone: 'UTC' };
  }
  return task;
}
