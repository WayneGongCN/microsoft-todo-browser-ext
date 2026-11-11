import { expect, test as base } from '@playwright/test';
import type { BrowserContext, Worker } from '@playwright/test';
import { resolve } from 'node:path';
import type { Capture, Draft } from '../../src/core/model';

const extensionId = 'gopiiihaachagcmaijfaphjijefgbgnk';
const extensionUrl = `chrome-extension://${extensionId}`;
const account = {
  id: 'test:person',
  tenantId: '9188040d-6c67-4c5b-b112-36a304b66dad',
  name: 'Test account',
  username: 'person@example.com',
};
type Fixtures = { context: BrowserContext; worker: Worker };

const test = base.extend<Fixtures>({
  context: async ({ playwright }, use) => {
    const path = resolve('.output/chrome-mv3-acceptance');
    const context = await playwright.chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      locale: 'zh-CN',
      viewport: { width: 390, height: 680 },
      args: [`--disable-extensions-except=${path}`, `--load-extension=${path}`],
    });
    await use(context);
    await context.close();
  },
  worker: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await worker.evaluate(async (account) => {
      await chrome.storage.session.set({
        'v2:auth': { account, accessToken: 'synthetic-test-token', expiresAt: Date.now() + 3_600_000 },
      });
      await chrome.storage.local.set({
        'v2:preferences': { language: 'zh_CN', theme: 'light', attachSource: true },
      });
    }, account);
    await use(worker);
  },
});

/** 独立测试浏览器只使用合成账号和模拟 Graph，绝不读取用户现有浏览器资料，喵~ */
async function routeLists(context: BrowserContext) {
  await context.route('https://graph.microsoft.com/v1.0/me/todo/lists**', async (route) => {
    if (route.request().method() === 'GET')
      await route.fulfill({
        json: {
          value: [
            { id: 'list-1', displayName: '任务', wellknownListName: 'defaultList' },
            { id: 'list-2', displayName: '稍后阅读' },
          ],
        },
      });
    else await route.fallback();
  });
}

/** 将已冻结的右键内容交给活动标签页，用普通测试页操作弹窗表单，喵~ */
async function openCapturePopup(context: BrowserContext, worker: Worker, capture: Capture) {
  const page = await context.newPage();
  await page.bringToFront();
  await worker.evaluate(async (capture) => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.storage.session.set({ [`v2:capture-tab:${tab!.id}`]: capture });
  }, capture);
  await page.goto(`${extensionUrl}/popup.html`);
  return page;
}

/** 等待收集内容和默认清单进入可编辑的弹窗草稿，喵~ */
async function openCaptured(context: BrowserContext, worker: Worker, title = '阅读这篇文章') {
  const page = await openCapturePopup(context, worker, {
    title,
    note: '保留选中文字',
    source: { title: 'Example article', url: 'https://example.com/article?keep=1#section' },
  });
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue(title);
  await expect(page.locator('#target-list')).toHaveValue('list-1');
  return page;
}

test('focuses a blank toolbar title and shows the current page as a source', async ({ context, worker }) => {
  await routeLists(context);
  // Use a host covered by the extension's permissions so no toolbar gesture is needed to grant activeTab.
  const url = 'https://graph.microsoft.com/toolbar-capture-test';
  await context.route(url, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Article</title>' }),
  );
  const popup = await context.newPage();
  const source = await context.newPage();
  await source.goto(url);
  await source.bringToFront();
  await popup.goto(new URL('popup.html', worker.url()).href);

  const title = popup.getByLabel('任务', { exact: true });
  await expect(title).toHaveValue('');
  await expect(title).toBeFocused();
  await expect(popup.getByRole('link', { name: /Article/ })).toHaveAttribute('href', url);
});

test('opens the browser action popup on the source tab when capturing selected text', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  const url = 'https://example.com/selection';
  const selectionText = '阅读选中的文字';
  await context.route(url, (route) => route.fulfill({ body: '<title>Article</title>' }));
  const source = await context.newPage();
  await source.goto(url);
  await source.bringToFront();
  const before = await worker.evaluate(async () => (await chrome.windows.getAll()).map(({ id }) => id));
  await worker.evaluate(
    async ({ selectionText, url }) => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const event = chrome.contextMenus.onClicked as typeof chrome.contextMenus.onClicked & {
        dispatch(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void;
      };
      event.dispatch({ menuItemId: 'selection', pageUrl: url, selectionText, editable: false }, tab!);
    },
    { selectionText, url },
  );
  await expect
    .poll(async () =>
      worker.evaluate(async () => {
        const [popup] = await chrome.runtime.getContexts({ contextTypes: ['POPUP'] });
        return popup?.documentUrl;
      }),
    )
    .toBe(`${extensionUrl}/popup.html`);
  await expect
    .poll(async () =>
      worker.evaluate(async () => {
        const draft = (await chrome.storage.local.get('v2:draft:test:person'))['v2:draft:test:person'] as
          Draft | undefined;
        return draft?.title;
      }),
    )
    .toBe(selectionText);
  expect(await worker.evaluate(async () => (await chrome.windows.getAll()).map(({ id }) => id))).toEqual(
    before,
  );
  expect(source.url()).toBe(url);
});

test('creates a task with source, notes, importance and an explicit reminder', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  const taskUrl = 'https://to-do.live.com/tasks/id/task%2Fwith%2Bpadding%3D/details';
  await context.route(taskUrl, (route) => route.fulfill({ body: 'Microsoft To Do task' }));
  let body: Record<string, unknown> | undefined;
  await context.route('**/lists/list-1/tasks', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { id: 'task/with+padding=', title: body!.title } });
  });
  const page = await openCaptured(context, worker);
  await page.getByLabel('标为重要').check();
  await page.locator('[name=reminder]').fill('2035-03-01T09:00');
  await expect(page.getByRole('status').last()).toContainText('草稿已保存在本机');
  await page.locator('[name=reminder]').blur();
  await page.screenshot({ path: 'test-results/capture-light.png', fullPage: true });
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  expect(body).toMatchObject({
    title: '阅读这篇文章',
    body: { content: '保留选中文字', contentType: 'text' },
    importance: 'high',
    isReminderOn: true,
    linkedResources: [
      {
        applicationName: 'Example article',
        displayName: 'https://example.com/article?keep=1#section',
        webUrl: 'https://example.com/article?keep=1#section',
      },
    ],
  });
  expect(body?.reminderDateTime).toMatchObject({ timeZone: 'UTC' });
  const [todo] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: /打开 Microsoft To Do/ }).click(),
  ]);
  await expect(todo).toHaveURL(taskUrl);
  await todo.close();
  await page.getByRole('button', { name: '继续添加' }).click();
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue('');
});

test('keeps draft text after a failed task request and after the window closes', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  await context.route('**/lists/list-1/tasks', (route) =>
    route.fulfill({ status: 403, json: { error: { code: 'accessDenied' } } }),
  );
  const page = await openCaptured(context, worker);
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await expect(page.getByRole('alert')).toContainText('微软拒绝访问');
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue('阅读这篇文章');
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto(`${extensionUrl}/popup.html`);
  await expect(reopened.getByLabel('任务', { exact: true })).toHaveValue('阅读这篇文章');
  await expect(reopened.locator('[name=note]')).toHaveValue('保留选中文字');
});

test('does not repeat a POST when its result is ambiguous', async ({ context, worker }) => {
  await routeLists(context);
  let attempts = 0;
  await context.route('**/lists/list-1/tasks', async (route) => {
    attempts++;
    await route.abort();
  });
  const page = await openCaptured(context, worker);
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await expect(page.getByRole('alert')).toContainText('暂时无法确认创建结果');
  await expect(page.getByRole('button', { name: '＋ 添加任务' })).toBeDisabled();
  expect(attempts).toBe(1);
  await page.getByRole('button', { name: '我已找到任务，完成' }).click();
  await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  await expect(page.getByRole('link', { name: /打开 Microsoft To Do/ })).toHaveAttribute(
    'href',
    'https://to-do.live.com/tasks/',
  );
  expect(attempts).toBe(1);
});

test('keeps the popup layout stable while submitting and finishes after closing', async ({
  context,
  worker,
}) => {
  await worker.evaluate(async (account) => {
    const session = (await chrome.storage.session.get('v2:auth'))['v2:auth'] as Record<string, unknown>;
    await chrome.storage.session.set({
      'v2:auth': { ...session, account: { ...account, tenantId: 'test-work-tenant' } },
    });
  }, account);
  await routeLists(context);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reached!: () => void;
  const received = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await context.route('**/lists/list-2/tasks', async (route) => {
    reached();
    await gate;
    await route.fulfill({ json: { id: 'task-after-close', title: 'Test' } });
  });
  const page = await openCaptured(context, worker);
  await page.locator('#target-list').selectOption('list-2');
  const popup = page.getByRole('main');
  const submit = page.getByRole('button', { name: '＋ 添加任务' });
  await expect(submit).toBeEnabled();
  const initialHeight = await popup.evaluate((element) => element.getBoundingClientRect().height);
  const initialButtonBounds = await submit.boundingBox();

  try {
    await submit.click();
    await received;
    await expect(page.getByRole('status')).toContainText('关闭弹窗');
    const adding = page.getByRole('button', { name: '正在添加…' });
    await expect(adding).toBeDisabled();
    await expect(page.getByRole('button', { name: '新建任务' })).toBeDisabled();
    expect(await popup.evaluate((element) => element.getBoundingClientRect().height)).toBe(initialHeight);
    expect(await adding.boundingBox()).toEqual(initialButtonBounds);
    await page.close();
  } finally {
    release();
  }
  await expect
    .poll(() =>
      worker.evaluate(
        async () =>
          (
            (await chrome.storage.local.get('v2:receipt:test:person'))['v2:receipt:test:person'] as
              { status?: string } | undefined
          )?.status,
      ),
    )
    .toBe('succeeded');
  const reopened = await context.newPage();
  await reopened.goto(`${extensionUrl}/popup.html`);
  await expect(reopened.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  await expect(reopened.getByRole('link', { name: /打开 Microsoft To Do/ })).toHaveAttribute(
    'href',
    'https://to-do.office.com/tasks/id/task-after-close/details',
  );
});

test('asks before replacing an unfinished draft with a different capture', async ({ context, worker }) => {
  await routeLists(context);
  const first = await openCaptured(context, worker, '原来的草稿');
  await first.getByLabel('任务', { exact: true }).fill('已修改的草稿');
  await expect(first.getByRole('status').last()).toContainText('草稿已保存在本机');
  const second = await openCapturePopup(context, worker, { title: '新的网页', note: '' });
  await expect(second.getByText('还有一份未提交的草稿。')).toBeVisible();
  await expect(second.getByLabel('任务', { exact: true })).toHaveValue('已修改的草稿');
  await second.getByRole('button', { name: '使用新内容' }).click();
  await expect(second.getByLabel('任务', { exact: true })).toHaveValue('新的网页');
});

for (const existingDraft of [false, true]) {
  test(`keeps ${existingDraft ? 'an existing' : 'a new'} draft editable after an overlong selection`, async ({
    context,
    worker,
  }) => {
    await routeLists(context);
    if (existingDraft) {
      const first = await openCaptured(context, worker, '继续编辑的草稿');
      await expect(first.getByRole('status').last()).toContainText('草稿已保存在本机');
      await first.close();
    }
    const page = await openCapturePopup(context, worker, { title: '过长的选区', note: '选'.repeat(20_001) });
    await expect(page.getByRole('alert')).toContainText('本次未导入');
    await expect(page.getByLabel('任务', { exact: true })).toHaveValue(existingDraft ? '继续编辑的草稿' : '');
    await expect(page.locator('[name=note]')).toHaveValue(existingDraft ? '保留选中文字' : '');
    await expect(page.locator('#target-list')).toHaveValue('list-1');
    await page.getByLabel('任务', { exact: true }).fill('仍然可以编辑');
    await expect(page.getByRole('status').last()).toContainText('草稿已保存在本机');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

test('allows keyboard task creation when the popup cannot read the active page', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  let posted: Record<string, unknown> | undefined;
  await context.route('**/lists/list-1/tasks', async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: { id: 'keyboard-task' } });
  });
  await expect(worker.evaluate(() => chrome.runtime.id)).resolves.toBe(extensionId);
  const page = await context.newPage();
  await page.goto(`${extensionUrl}/popup.html`);
  await expect(page.getByText('无法读取此页面，仍可手动输入任务。')).toBeVisible();
  await expect(page.locator('#target-list')).toHaveValue('list-1');
  expect(
    await page.locator('main').evaluate((element) => element.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(600);
  const title = page.getByLabel('任务', { exact: true });
  await title.fill('中文 <b> & emoji 😀');
  await title.press('Tab');
  await expect(page.locator('#target-list')).toBeFocused();
  expect(
    await page.locator('#target-list').evaluate((element) => getComputedStyle(element).outlineWidth),
  ).not.toBe('0px');
  await title.press('Control+Enter');
  await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  expect(posted?.title).toBe('中文 <b> & emoji 😀');
  expect(posted?.linkedResources).toBeUndefined();
});

test('supports English and dark mode and fits a narrow settings tab', async ({ context, worker }) => {
  await routeLists(context);
  const page = await context.newPage();
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(new URL('options.html', worker.url()).href);
  await expect(page.getByLabel('语言', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('语言', { exact: true }).selectOption('en');
  await expect(page.getByLabel('Appearance')).toBeVisible();
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/settings-dark.png', fullPage: true });
});

test('notifies another window about account changes without revealing old data', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  const page = await openCaptured(context, worker);
  await worker.evaluate(async () => {
    await chrome.storage.session.remove('v2:auth');
    await chrome.runtime.sendMessage({ type: 'session_changed', accountId: 'guest' });
  });
  await expect(page.getByRole('alert')).toContainText('另一个窗口切换了微软账号');
  await expect(page.getByLabel('任务', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '重新载入', exact: true }).click();
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue('');
  await expect(page.locator('#target-list')).toBeDisabled();
});

for (const attachSource of [true, false]) {
  test(`omits the source from Graph when ${attachSource ? 'removed' : 'disabled'}`, async ({
    context,
    worker,
  }) => {
    await routeLists(context);
    let body: Record<string, unknown> | undefined;
    await context.route('**/lists/list-1/tasks', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { id: 'task-without-source', title: body!.title } });
    });
    if (!attachSource) {
      await worker.evaluate(async () => {
        await chrome.storage.local.set({
          'v2:preferences': { language: 'zh_CN', theme: 'light', attachSource: false },
        });
      });
    }
    const page = await openCaptured(context, worker);
    const removeSource = page.getByRole('button', { name: '移除来源网页' });
    if (attachSource) await removeSource.click();
    await expect(removeSource).toHaveCount(0);
    await page.getByRole('button', { name: '＋ 添加任务' }).click();
    await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
    expect(body?.linkedResources).toBeUndefined();
  });
}

test('recovers a stopped service worker without replaying a pending creation', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  let attempts = 0;
  let reached!: () => void;
  const received = new Promise<void>((resolve) => {
    reached = resolve;
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await context.route('**/lists/list-1/tasks', async (route) => {
    attempts++;
    reached();
    await gate;
    try {
      await route.fulfill({ json: { id: 'possibly-created', title: 'Test' } });
    } catch {
      /* 工作线程已停止时不再兑现旧网络请求，喵~ */
    }
  });
  const page = await openCaptured(context, worker);
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await received;
  const cdp = await context.newCDPSession(page);
  await cdp.send('ServiceWorker.enable');
  await cdp.send('ServiceWorker.stopAllWorkers');
  release();
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('暂时无法确认创建结果');
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue('阅读这篇文章');
  expect(attempts).toBe(1);
});

base(
  'requires a new session after browser restart and keeps account drafts isolated',
  async ({ playwright }) => {
    const { mkdir, mkdtemp, rm } = await import('node:fs/promises');
    await mkdir('work', { recursive: true });
    const profile = await mkdtemp(resolve('work', 'restart-profile-'));
    const path = resolve('.output/chrome-mv3-acceptance');
    const options = {
      channel: 'chromium',
      headless: true,
      locale: 'zh-CN',
      viewport: { width: 390, height: 680 },
      args: [`--disable-extensions-except=${path}`, `--load-extension=${path}`],
    };
    let context = await playwright.chromium.launchPersistentContext(profile, options);
    try {
      let worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      await worker.evaluate(async (account) => {
        await chrome.storage.session.set({
          'v2:auth': { account, accessToken: 'synthetic-test-token', expiresAt: Date.now() + 3_600_000 },
        });
        await chrome.storage.local.set({
          'v2:preferences': { language: 'zh_CN', theme: 'light', attachSource: true },
        });
      }, account);
      await routeLists(context);
      const first = await openCaptured(context, worker, '重启后保留的任务');
      await expect(first.getByRole('status').last()).toContainText('草稿已保存在本机');
      await context.close();
      context = await playwright.chromium.launchPersistentContext(profile, options);
      worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const guest = await context.newPage();
      await guest.goto(`${extensionUrl}/popup.html`);
      await expect(guest.getByLabel('任务', { exact: true })).toHaveValue('');
      await expect(guest.locator('#target-list')).toBeDisabled();
      expect(
        await worker.evaluate(async () => (await chrome.storage.session.get('v2:auth'))['v2:auth']),
      ).toBeUndefined();
      await worker.evaluate(async (account) => {
        await chrome.storage.session.set({
          'v2:auth': { account, accessToken: 'synthetic-test-token', expiresAt: Date.now() + 3_600_000 },
        });
      }, account);
      await routeLists(context);
      await guest.reload();
      await expect(guest.getByLabel('任务', { exact: true })).toHaveValue('重启后保留的任务');
    } finally {
      await context.close();
      await rm(profile, { recursive: true, force: true });
    }
  },
);
