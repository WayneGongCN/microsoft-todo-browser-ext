import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Account } from '../src/core/auth';
import type { Draft, Receipt } from '../src/core/model';
import type { Snapshot } from '../src/core/protocol';

const mocks = vi.hoisted(() => ({
  account: undefined as Account | undefined,
  create: vi.fn(),
  lists: vi.fn(),
}));
vi.mock('../src/core/auth', () => ({
  getAccount: async () => mocks.account,
  login: async () => mocks.account,
  logout: async () => {
    mocks.account = undefined;
  },
}));
vi.mock('../src/core/graph', () => ({ createTask: mocks.create, getLists: mocks.lists }));
let data: Record<string, unknown>;
let Failure: typeof import('../src/core/errors').AppError;

/** 只用测试数据模拟浏览器存储，写入行为仍由真正后台服务实现，喵~ */
function storage() {
  return {
    get: vi.fn(async (key: string | null) =>
      key === null ? structuredClone(data) : { [key]: structuredClone(data[key]) },
    ),
    set: vi.fn(async (values: Record<string, unknown>) => {
      Object.assign(data, structuredClone(values));
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      for (const key of [keys].flat()) delete data[key];
    }),
    setAccessLevel: vi.fn(async () => undefined),
  };
}

beforeEach(async () => {
  vi.resetModules();
  Failure = (await import('../src/core/errors')).AppError;
  data = {};
  mocks.account = {
    id: 'tenant:subject',
    tenantId: 'tenant',
    name: 'Test account',
    username: 'person@example.com',
  };
  mocks.create.mockReset().mockResolvedValue({ id: 'created-task', title: 'Test task' });
  mocks.lists
    .mockReset()
    .mockResolvedValue([{ id: 'list-1', displayName: 'Tasks', wellknownListName: 'defaultList' }]);
  vi.stubGlobal('chrome', {
    storage: { local: storage(), session: storage(), sync: storage() },
    tabs: {
      get: async () => ({ title: 'A different page', url: 'https://example.com/other' }),
    },
    scripting: { executeScript: async () => [{ result: '' }] },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const analyticsPreference = 'v2:analytics-enabled';
const legacyAnalyticsId = 'v2:analytics-client-id';

for (const [browser, edge] of [
  ['Chrome', false],
  ['Edge', true],
] as const) {
  it(`${browser} reports by default and persists opt-out`, async () => {
    vi.stubEnv('EDGE', edge ? 'true' : '');
    vi.stubEnv('WXT_ANALYTICS_ENDPOINT', 'https://analytics.example.test/');
    vi.stubGlobal('chrome', { ...chrome, runtime: { getManifest: () => ({ version: '2.0.5' }) } });
    const send = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    const service = await import('../src/core/service');
    const { trackAnalytics } = await import('../src/core/analytics');
    await service.initialize();
    expect(await service.handle({ type: 'bootstrap' })).toMatchObject({ analyticsEnabled: true });
    await trackAnalytics({ name: 'extension_open', surface: 'popup' });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      'https://analytics.example.test/',
      expect.objectContaining({
        body: JSON.stringify({ version: '2.0.5', event: 'extension_open', surface: 'popup' }),
        credentials: 'omit',
      }),
    );

    expect(await service.handle({ type: 'analytics_consent', enabled: false })).toBe(false);
    await service.initialize();
    expect(await service.handle({ type: 'bootstrap' })).toMatchObject({ analyticsEnabled: false });
    await trackAnalytics({ name: 'task_created' });
    expect(send).toHaveBeenCalledTimes(1);

    expect(await service.handle({ type: 'analytics_consent', enabled: true })).toBe(true);
    await trackAnalytics({ name: 'task_created' });
    expect(send).toHaveBeenCalledTimes(2);
    expect(data[legacyAnalyticsId]).toBeUndefined();
  });
}

it.each([
  { edge: false, legacyId: undefined, enabled: false },
  { edge: false, legacyId: '123.456', enabled: true },
  { edge: true, legacyId: undefined, enabled: true },
])('migrates existing analytics preferences ($edge, $legacyId)', async ({ edge, legacyId, enabled }) => {
  vi.stubEnv('EDGE', edge ? 'true' : '');
  data['v2:migrated'] = true;
  if (legacyId) data[legacyAnalyticsId] = legacyId;
  data['v2:analytics-session'] = { id: 123 };
  const service = await import('../src/core/service');
  await service.initialize();
  expect(data[analyticsPreference]).toBe(enabled);
  expect(data[legacyAnalyticsId]).toBeUndefined();
  expect(data['v2:analytics-session']).toBeUndefined();
  await service.initialize();
  expect(await service.handle({ type: 'bootstrap' })).toMatchObject({ analyticsEnabled: enabled });
});

/** 准备一个由真实保存命令持久化的草稿，喵~ */
async function prepared() {
  const service = await import('../src/core/service');
  const initial = (await service.handle({ type: 'bootstrap' })) as Snapshot;
  await service.handle({ type: 'lists', accountId: initial.accountId });
  const draft = (await service.handle({
    type: 'save',
    accountId: initial.accountId,
    draftId: initial.draft.id,
    revision: initial.draft.revision,
    fields: {
      title: 'Keep this draft',
      note: 'All notes must survive',
      listId: 'list-1',
      important: true,
      reminder: '',
    },
  })) as Draft;
  const command = {
    type: 'submit' as const,
    accountId: initial.accountId,
    draftId: draft.id,
    revision: draft.revision,
  };
  return { service, draft, command };
}

describe('background task and draft lifecycle', () => {
  it('starts a toolbar draft with a blank task title and keeps the page as its source', async () => {
    const service = await import('../src/core/service');
    const result = (await service.handle({ type: 'open_popup', tabId: 1 })) as Snapshot;
    expect(result.draft).toMatchObject({
      title: '',
      note: '',
      source: { title: 'A different page', url: 'https://example.com/other' },
    });
  });

  it('keeps an existing draft when a new page is captured', async () => {
    const { service, draft } = await prepared();
    const result = (await service.handle({
      type: 'open_popup',
      tabId: 1,
    })) as Snapshot;
    expect(result.draft).toEqual(draft);
    expect(result.candidate).toMatchObject({
      title: '',
      source: { title: 'A different page', url: 'https://example.com/other' },
    });
  });

  it('preserves all fields after a definite creation failure', async () => {
    const { service, draft, command } = await prepared();
    mocks.create.mockRejectedValueOnce(new Failure('forbidden'));
    const receipt = (await service.handle(command)) as Receipt;
    expect(receipt.status).toBe('failed');
    expect(data[`v2:draft:${command.accountId}`]).toEqual(draft);
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it('shares one submission between simultaneous windows', async () => {
    const { service, command } = await prepared();
    const result = (await Promise.all([service.handle(command), service.handle(command)])) as Receipt[];
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(result.map((receipt) => receipt.status)).toEqual(['succeeded', 'succeeded']);
  });

  it('never automatically replays an ambiguous POST', async () => {
    const { service, draft, command } = await prepared();
    mocks.create.mockRejectedValueOnce(new Failure('unknown'));
    expect(((await service.handle(command)) as Receipt).status).toBe('unknown');
    await service.handle(command);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(data[`v2:draft:${command.accountId}`]).toEqual(draft);
    await expect(service.handle({ ...command, type: 'new' })).rejects.toMatchObject({ code: 'unknown' });
  });

  it('recovers interrupted worker state as unknown without a network request', async () => {
    const { draft, command } = await prepared();
    data[`v2:receipt:${command.accountId}`] = {
      id: `${draft.id}:${draft.revision}`,
      draftId: draft.id,
      revision: draft.revision,
      accountId: command.accountId,
      status: 'sending',
      workerId: 'previous-worker',
      createdAt: Date.now(),
    } satisfies Receipt;
    vi.resetModules();
    const service = await import('../src/core/service');
    const state = (await service.handle({ type: 'bootstrap' })) as Snapshot;
    expect(state.receipt?.status).toBe('unknown');
    expect(state.draft).toEqual(draft);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('clears only the submitted draft after a verified success', async () => {
    const { service, draft, command } = await prepared();
    const receipt = (await service.handle(command)) as Receipt;
    const next = (await service.handle({ type: 'bootstrap' })) as Snapshot;
    expect(receipt.taskId).toBe('created-task');
    expect(next.receipt).toEqual(receipt);
    expect(next.draft.id).not.toBe(draft.id);
    expect(next.draft.title).toBe('');
    expect(next.draft.listId).toBe('list-1');

    const reopened = (await service.handle({ type: 'open_popup' })) as Snapshot;
    expect(reopened.receipt).toBeUndefined();
    expect(reopened.draft).toEqual(next.draft);
    expect(await service.handle(command)).toEqual(receipt);
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it('does not erase a newer draft while an older request finishes', async () => {
    const { service, command } = await prepared();
    mocks.create.mockImplementationOnce(async () => {
      const current = data[`v2:draft:${command.accountId}`] as Draft;
      data[`v2:draft:${command.accountId}`] = {
        ...current,
        title: 'A newer thought',
        revision: current.revision + 1,
      };
      return { id: 'created-task' };
    });
    await service.handle(command);
    expect((data[`v2:draft:${command.accountId}`] as Draft).title).toBe('A newer thought');
  });

  it('rejects stale revisions and requests from an old account', async () => {
    const { service, draft, command } = await prepared();
    await expect(
      service.handle({ ...command, type: 'save', revision: draft.revision - 1, fields: draft }),
    ).rejects.toMatchObject({ code: 'conflict' });
    mocks.account = { ...mocks.account!, id: 'different-account' };
    await expect(service.handle(command)).rejects.toMatchObject({ code: 'auth_required' });
    const next = (await service.handle({ type: 'bootstrap' })) as Snapshot;
    expect(next.draft.title).toBe('');
    expect(next.lists).toEqual([]);
  });

  it('caches an empty list response without a request loop', async () => {
    mocks.lists.mockResolvedValue([]);
    const service = await import('../src/core/service');
    await service.handle({ type: 'lists', accountId: mocks.account!.id });
    await service.handle({ type: 'lists', accountId: mocks.account!.id });
    expect(mocks.lists).toHaveBeenCalledTimes(1);
  });

  it('refreshes the list cache after five minutes', async () => {
    const { service, command } = await prepared();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 301_000);
    try {
      mocks.lists.mockResolvedValueOnce([{ id: 'new-list', displayName: 'New list' }]);
      const lists = await service.handle({ type: 'lists', accountId: command.accountId });
      expect(lists).toEqual([{ id: 'new-list', displayName: 'New list' }]);
      expect(mocks.lists).toHaveBeenCalledTimes(2);
    } finally {
      clock.mockRestore();
    }
  });

  it('requires another list when the draft target was deleted', async () => {
    const { service, command, draft } = await prepared();
    mocks.lists.mockResolvedValueOnce([{ id: 'new-list', displayName: 'New list' }]);
    await service.handle({ type: 'lists', accountId: command.accountId, force: true });
    await expect(service.handle(command)).rejects.toMatchObject({ code: 'not_found' });
    expect(data[`v2:draft:${command.accountId}`]).toEqual(draft);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('lets the user resolve an ambiguous result without sending another task', async () => {
    const { service, command } = await prepared();
    mocks.create.mockRejectedValueOnce(new Failure('unknown'));
    await service.handle(command);
    const next = (await service.handle({ ...command, type: 'confirm_present' })) as Snapshot;
    expect(next.receipt?.resolution).toBe('confirmed_present');
    expect(next.draft.title).toBe('');
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });
});

it('restores the full guest draft only after the user chooses it', async () => {
  const { service, command, draft } = await prepared();
  const guest = {
    ...draft,
    id: crypto.randomUUID(),
    title: 'Guest draft',
    note: 'Guest notes',
    important: true,
    reminder: '2035-02-10T09:00',
  };
  data['v2:draft:guest'] = guest;
  const snapshot = (await service.handle({ type: 'login' })) as Snapshot;
  expect(snapshot.draft.title).toBe('Keep this draft');
  expect(snapshot.guestDraft).toEqual(guest);
  const restored = (await service.handle({ ...command, type: 'restore_guest' })) as Draft;
  expect(restored).toMatchObject({
    title: guest.title,
    note: guest.note,
    important: true,
    reminder: guest.reminder,
  });
  expect(data['v2:draft:guest']).toBeUndefined();
});

it('recovers an unrecorded server success as unknown after local storage fails', async () => {
  const { service, command, draft } = await prepared();
  vi.mocked(chrome.storage.local.set).mockImplementation(async (values) => {
    const receipt = (values as Record<string, unknown>)[`v2:receipt:${command.accountId}`] as
      Receipt | undefined;
    if (receipt?.status === 'succeeded') throw new Error('Simulated full storage');
    Object.assign(data, structuredClone(values));
  });
  await expect(service.handle(command)).rejects.toMatchObject({ code: 'storage' });
  const next = (await service.handle({ type: 'bootstrap' })) as Snapshot;
  expect(next.receipt?.status).toBe('unknown');
  expect(next.draft).toEqual(draft);
  expect(mocks.create).toHaveBeenCalledTimes(1);
});
