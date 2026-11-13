import * as auth from './auth';
import { capturePage, pendingCaptureKey } from './capture';
import * as graph from './graph';
import { AppError, publicError } from './errors';
import {
  DEFAULT_PREFERENCES,
  emptyDraft,
  hasContent,
  MAX_NOTE_LENGTH,
  parseFields,
  taskInput,
} from './model';
import type { Capture, Draft, Preferences, Receipt } from './model';
import type { Request, Snapshot } from './protocol';
import { read, remove, Transactions, write } from './storage';

const workerId = crypto.randomUUID();
const transactions = new Transactions();
const active = new Map<string, Promise<Receipt>>();
type ListCache = { lists: graph.TodoList[]; updatedAt: number };

/** 每次业务操作核对当前账号，避免旧窗口在切号后继续写入，喵~ */
async function identity(expected?: string): Promise<string> {
  const key = (await auth.getAccount())?.id ?? 'guest';
  if (expected !== undefined && key !== expected) throw new AppError('auth_required');
  return key;
}

/** 账号私有清单设置与全局外观设置分开存放，喵~ */
async function preferences(accountId: string): Promise<Preferences> {
  return {
    ...DEFAULT_PREFERENCES,
    ...(await read<Partial<Preferences>>('v2:preferences')),
    ...(await read<Partial<Preferences>>(`v2:list-preferences:${accountId}`)),
  };
}

/** 首次创建账号草稿，后续操作都沿用持久化的版本号，喵~ */
async function draftFor(accountId: string): Promise<Draft> {
  const existing = await read<Draft>(`v2:draft:${accountId}`);
  if (existing) return existing;
  const prefs = await preferences(accountId);
  const draft = emptyDraft(prefs.defaultListId);
  await write({ [`v2:draft:${accountId}`]: draft });
  return draft;
}

/** 对照草稿版本拒绝并发覆盖，让另一窗口保留其未保存输入，喵~ */
async function checkedDraft(accountId: string, draftId: string, revision: number): Promise<Draft> {
  const draft = await draftFor(accountId);
  if (draft.id !== draftId || draft.revision !== revision) throw new AppError('conflict');
  return draft;
}

/** 后台重启后的在途记录只能标记结果待确认，不能假定失败并重新提交，喵~ */
async function latestReceipt(accountId: string): Promise<Receipt | undefined> {
  const receipt = await read<Receipt>(`v2:receipt:${accountId}`);
  if (receipt?.status === 'sending' && !active.has(receipt.id)) {
    receipt.status = 'unknown';
    await write({ [`v2:receipt:${accountId}`]: receipt, [`v2:operation:${receipt.id}`]: receipt });
  }
  return receipt;
}

/** 确认没有结果未明的提交后才允许修改同一草稿，喵~ */
async function editable(accountId: string, draftId: string): Promise<void> {
  const receipt = await latestReceipt(accountId);
  if (receipt?.draftId === draftId && ['sending', 'unknown'].includes(receipt.status))
    throw new AppError(receipt.status === 'unknown' ? 'unknown' : 'busy');
}

/** 生成编辑器视图，凭据和其他账号数据不离开后台，喵~ */
async function snapshot(opening?: {
  capture?: Capture;
  captureOrigin?: Snapshot['captureOrigin'];
}): Promise<Snapshot> {
  const account = await auth.getAccount();
  const accountId = account?.id ?? 'guest';
  let draft = await draftFor(accountId);
  const prefs = await preferences(accountId);
  let receipt = await latestReceipt(accountId);
  if (opening && receipt?.status === 'succeeded') {
    await remove([`v2:receipt:${accountId}`]);
    receipt = undefined;
  }
  const capture = opening?.capture;
  let candidate = capture;
  if (capture && !hasContent(draft)) {
    const fields = parseFields({
      ...draft,
      ...capture,
      source: prefs.attachSource ? capture.source : undefined,
    });
    draft = { ...draft, ...fields, revision: draft.revision + 1, updatedAt: Date.now() };
    await write({ [`v2:draft:${accountId}`]: draft });
    candidate = undefined;
  }
  const cache = account ? await read<ListCache>(`v2:lists:${accountId}`) : undefined;
  await identity(accountId);
  return {
    account,
    accountId,
    draft,
    preferences: prefs,
    lists: cache?.lists ?? [],
    receipt,
    captureOrigin: opening?.captureOrigin,
    guestDraft: account ? await read<Draft>(`v2:pending-guest:${accountId}`) : undefined,
    ...(candidate ? { candidate } : {}),
  };
}

/** 清单缓存限时复用，远端空清单会作为正常结果保存，喵~ */
async function lists(accountId: string, force = false): Promise<graph.TodoList[]> {
  await identity(accountId);
  if (accountId === 'guest') throw new AppError('auth_required');
  const cache = await read<ListCache>(`v2:lists:${accountId}`);
  if (!force && cache && Date.now() - cache.updatedAt < 5 * 60_000) return cache.lists;
  const result = (await graph.getLists(accountId)).filter(
    (list) => list.wellknownListName !== 'flaggedEmails',
  );
  await identity(accountId);
  await write({ [`v2:lists:${accountId}`]: { lists: result, updatedAt: Date.now() } });
  return result;
}

/** 先持久化提交回执，再把唯一一次网络写入交给后台处理，喵~ */
async function submit(accountId: string, draftId: string, revision: number): Promise<Receipt> {
  await identity(accountId);
  if (accountId === 'guest') throw new AppError('auth_required');
  const operationId = `${draftId}:${revision}`;
  const running = active.get(operationId);
  if (running) return running;
  const existing = await read<Receipt>(`v2:operation:${operationId}`);
  if (existing) {
    if (existing.accountId !== accountId) throw new AppError('invalid');
    if (existing.status === 'sending' && !active.has(operationId)) {
      existing.status = 'unknown';
      await write({ [`v2:operation:${operationId}`]: existing, [`v2:receipt:${accountId}`]: existing });
    }
    return existing;
  }
  const started = active.get(operationId);
  if (started) return started;
  const task = (async () => {
    const { draft, input, receipt } = await transactions.run(async () => {
      const draft = await checkedDraft(accountId, draftId, revision);
      await editable(accountId, draftId);
      const input = taskInput(draft);
      const cached = await read<ListCache>(`v2:lists:${accountId}`);
      if (!cached?.lists.some((list) => list.id === draft.listId)) throw new AppError('not_found');
      const receipt: Receipt = {
        id: operationId,
        draftId,
        revision,
        accountId,
        status: 'sending',
        createdAt: Date.now(),
        workerId,
      };
      await write({ [`v2:operation:${operationId}`]: receipt, [`v2:receipt:${accountId}`]: receipt });
      return { draft, input, receipt };
    });
    try {
      const created = await graph.createTask(accountId, draft.listId, input);
      receipt.status = 'succeeded';
      receipt.taskId = created.id;
    } catch (error) {
      const safe = publicError(error);
      receipt.status = safe.code === 'unknown' ? 'unknown' : 'failed';
      receipt.error = safe;
    }
    await transactions.run(async () => {
      const values: Record<string, unknown> = {
        [`v2:operation:${operationId}`]: receipt,
        [`v2:receipt:${accountId}`]: receipt,
      };
      const current = await read<Draft>(`v2:draft:${accountId}`);
      if (
        receipt.status === 'succeeded' &&
        current?.id === draft.id &&
        current.revision === revision &&
        (await auth.getAccount())?.id === accountId
      ) {
        const prefs = await preferences(accountId);
        const nextList = prefs.listMode === 'recent' ? draft.listId : prefs.defaultListId;
        values[`v2:draft:${accountId}`] = emptyDraft(nextList);
        if (prefs.listMode === 'recent')
          values[`v2:list-preferences:${accountId}`] = {
            listMode: prefs.listMode,
            defaultListId: draft.listId,
          };
      }
      await write(values);
    });
    return receipt;
  })();
  active.set(operationId, task);
  try {
    return await task;
  } finally {
    active.delete(operationId);
  }
}

/** 验证收集内容的大小及来源，新页面文字始终视为普通文本，喵~ */
function parseCapture(value: unknown): Capture {
  if (
    value &&
    typeof value === 'object' &&
    'note' in value &&
    typeof value.note === 'string' &&
    value.note.length > MAX_NOTE_LENGTH
  )
    throw new AppError('capture_too_large');
  const fields = parseFields({
    title: '',
    note: '',
    important: false,
    reminder: '',
    listId: '',
    ...(value && typeof value === 'object' ? value : {}),
  });
  return { title: fields.title, note: fields.note, ...(fields.source ? { source: fields.source } : {}) };
}

/** 解析有限的业务消息，拒绝任意请求地址及未经校验的设置，喵~ */
export function parseRequest(value: unknown): Request {
  if (!value || typeof value !== 'object') throw new AppError('invalid');
  const raw = value as Record<string, unknown>;
  if (typeof raw.type !== 'string') throw new AppError('invalid');
  if (raw.type === 'bootstrap' || raw.type === 'login' || raw.type === 'logout') return { type: raw.type };
  if (raw.type === 'open_popup') {
    if (raw.tabId === undefined) return { type: 'open_popup' };
    if (typeof raw.tabId !== 'number' || !Number.isSafeInteger(raw.tabId) || raw.tabId < 0)
      throw new AppError('invalid');
    return {
      type: 'open_popup',
      tabId: raw.tabId,
    };
  }
  if (typeof raw.accountId !== 'string' || raw.accountId.length > 512) throw new AppError('invalid');
  if (raw.type === 'lists') return { type: 'lists', accountId: raw.accountId, force: raw.force === true };
  if (raw.type === 'preferences') {
    const prefs = raw.preferences as Preferences | undefined;
    if (
      !prefs ||
      !['system', 'light', 'dark'].includes(prefs.theme) ||
      !['system', 'en', 'zh_CN'].includes(prefs.language) ||
      typeof prefs.attachSource !== 'boolean' ||
      !['recent', 'fixed'].includes(prefs.listMode) ||
      typeof prefs.defaultListId !== 'string' ||
      prefs.defaultListId.length > 1024
    )
      throw new AppError('invalid');
    return {
      type: 'preferences',
      accountId: raw.accountId,
      preferences: {
        theme: prefs.theme,
        language: prefs.language,
        attachSource: prefs.attachSource,
        listMode: prefs.listMode,
        defaultListId: prefs.defaultListId,
      },
    };
  }
  if (
    typeof raw.draftId !== 'string' ||
    !/^[\da-f-]{36}$/i.test(raw.draftId) ||
    !Number.isSafeInteger(raw.revision) ||
    Number(raw.revision) < 0
  )
    throw new AppError('invalid');
  const base = { accountId: raw.accountId, draftId: raw.draftId, revision: Number(raw.revision) };
  if (raw.type === 'save') return { type: 'save', ...base, fields: parseFields(raw.fields) };
  if (raw.type === 'capture') return { type: 'capture', ...base, capture: parseCapture(raw.capture) };
  if (
    ['submit', 'new', 'acknowledge', 'confirm_absent', 'confirm_present', 'restore_guest'].includes(raw.type)
  )
    return { type: raw.type, ...base } as Request;
  throw new AppError('invalid');
}

/** 分派后台命令，所有草稿写入与提交都经过账号和版本核验，喵~ */
export async function handle(request: Request): Promise<unknown> {
  if (request.type === 'login') {
    const account = await auth.login();
    return transactions.run(async () => {
      const guest = await read<Draft>('v2:draft:guest');
      const current = await read<Draft>(`v2:draft:${account.id}`);
      if (guest && hasContent(guest) && (!current || !hasContent(current))) {
        await write({ [`v2:draft:${account.id}`]: guest });
        await remove(['v2:draft:guest']);
      }
      if (guest && hasContent(guest) && current && hasContent(current)) {
        await write({ [`v2:pending-guest:${account.id}`]: guest });
        await remove(['v2:draft:guest']);
      }
      return snapshot();
    });
  }
  if (request.type === 'logout') {
    return transactions.run(async () => {
      const key = await identity();
      await auth.logout();
      await remove([
        `v2:draft:${key}`,
        `v2:pending-guest:${key}`,
        `v2:lists:${key}`,
        `v2:list-preferences:${key}`,
      ]);
      return snapshot();
    });
  }
  if (request.type === 'bootstrap') return transactions.run(() => snapshot());
  if (request.type === 'open_popup') {
    const tabId = request.tabId;
    if (tabId === undefined) return transactions.run(() => snapshot({}));
    const key = pendingCaptureKey(tabId);
    const pending = (await chrome.storage.session.get(key))[key] as Capture | undefined;
    if (pending) {
      await chrome.storage.session.remove(key);
      void chrome.action.setBadgeText({ tabId, text: '' }).catch(() => undefined);
    }
    const capture = pending ?? (await capturePage(tabId));
    return transactions.run(() =>
      snapshot({
        capture: capture ? parseCapture(capture) : undefined,
        captureOrigin: pending ? 'menu' : capture ? 'page' : undefined,
      }),
    );
  }
  await identity(request.accountId);
  if (request.type === 'lists') return lists(request.accountId, request.force);
  if (request.type === 'submit') return submit(request.accountId, request.draftId, request.revision);
  return transactions.run(async () => {
    await identity(request.accountId);
    const key = request.accountId;
    if (request.type === 'preferences') {
      const prefs = request.preferences;
      await write({
        'v2:preferences': { theme: prefs.theme, language: prefs.language, attachSource: prefs.attachSource },
        [`v2:list-preferences:${key}`]: { listMode: prefs.listMode, defaultListId: prefs.defaultListId },
      });
      return prefs;
    }
    const current = await checkedDraft(key, request.draftId, request.revision);
    if (request.type === 'acknowledge') {
      await editable(key, current.id);
      await remove([`v2:receipt:${key}`, `v2:pending-guest:${key}`]);
      return snapshot();
    }
    if (request.type === 'confirm_absent' || request.type === 'confirm_present') {
      const receipt = await latestReceipt(key);
      if (receipt?.status !== 'unknown' || receipt.draftId !== current.id) throw new AppError('invalid');
      if (request.type === 'confirm_present') {
        receipt.status = 'succeeded';
        receipt.resolution = 'confirmed_present';
        await write({
          [`v2:draft:${key}`]: emptyDraft((await preferences(key)).defaultListId),
          [`v2:receipt:${key}`]: receipt,
          [`v2:operation:${receipt.id}`]: receipt,
        });
        return snapshot();
      }
      receipt.resolution = 'confirmed_absent';
      const next = { ...current, revision: current.revision + 1 };
      await write({ [`v2:draft:${key}`]: next, [`v2:operation:${receipt.id}`]: receipt });
      await remove([`v2:receipt:${key}`]);
      return snapshot();
    }
    await editable(key, current.id);
    if (request.type === 'new') {
      await write({ [`v2:draft:${key}`]: emptyDraft((await preferences(key)).defaultListId) });
      await remove([`v2:receipt:${key}`]);
      return snapshot();
    }
    if (request.type === 'restore_guest') {
      const guest = await read<Draft>(`v2:pending-guest:${key}`);
      if (!guest || !hasContent(guest)) throw new AppError('invalid');
      const next: Draft = {
        ...parseFields(guest),
        listId: guest.listId || current.listId,
        id: current.id,
        revision: current.revision + 1,
        updatedAt: Date.now(),
      };
      await write({ [`v2:draft:${key}`]: next });
      await remove([`v2:pending-guest:${key}`]);
      return next;
    }
    const fields =
      request.type === 'capture'
        ? parseFields({
            ...emptyDraft(current.listId),
            ...request.capture,
            source: (await preferences(key)).attachSource ? request.capture.source : undefined,
          })
        : request.fields;
    const next: Draft = { ...fields, id: current.id, revision: current.revision + 1, updatedAt: Date.now() };
    await write({ [`v2:draft:${key}`]: next });
    return next;
  });
}

/** 初始化时清理旧版认证缓存和停用统计留下的本地数据，喵~ */
export async function initialize(): Promise<void> {
  await Promise.all([
    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }),
    chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }),
    chrome.storage.session.remove('v2:analytics-session'),
  ]);
  if (!(await read<boolean>('v2:migrated'))) {
    await chrome.storage.sync.remove([
      'persist:auth',
      'persist:popup',
      'persist:tasklist',
      'persist:options',
      'persist:conf',
    ]);
    await write({ 'v2:migrated': true });
  }
  const all = await chrome.storage.local.get(null);
  const stale = Object.entries(all)
    .filter(([key]) => key.startsWith('v2:operation:'))
    .sort((a, b) => Number((b[1] as Receipt).createdAt) - Number((a[1] as Receipt).createdAt))
    .filter(
      ([, value], index) =>
        index >= 100 || Date.now() - Number((value as Receipt).createdAt) > 7 * 24 * 60 * 60_000,
    )
    .map(([key]) => key);
  for (const key of ['v2:analytics-client-id', 'v2:analytics-enabled']) {
    if (Object.hasOwn(all, key)) stale.push(key);
  }
  if (stale.length) await remove(stale);
}
