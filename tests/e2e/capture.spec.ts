import { expect, test as base } from '@playwright/test';
import type { BrowserContext, Worker } from '@playwright/test';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

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

/** 模拟右键已冻结的上下文，编辑器仍通过真实后台消息和本机存储恢复它，喵~ */
async function openCaptured(context: BrowserContext, worker: Worker, title = '阅读这篇文章') {
  const id = randomUUID();
  await worker.evaluate(
    async ({ id, title }) => {
      await chrome.storage.session.set({
        [`v2:capture:${id}`]: {
          title,
          note: '保留选中文字',
          source: { title: 'Example article', url: 'https://example.com/article?keep=1' },
        },
      });
    },
    { id, title },
  );
  const page = await context.newPage();
  await page.goto(`${extensionUrl}/capture.html?capture=${id}`);
  await expect(page.getByLabel('任务', { exact: true })).toHaveValue(title);
  await expect(page.locator('#target-list')).toHaveValue('list-1');
  return page;
}

test('creates a task with source, notes, importance and an explicit reminder', async ({
  context,
  worker,
}) => {
  await routeLists(context);
  let body: Record<string, unknown> | undefined;
  await context.route('**/lists/list-1/tasks', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { id: 'task-1', title: body!.title } });
  });
  const page = await openCaptured(context, worker);
  await page.getByLabel('标为重要').check();
  await page.locator('[name=reminder]').fill('2035-03-01T09:00');
  await page.screenshot({ path: 'test-results/capture-light.png', fullPage: true });
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  expect(body).toMatchObject({
    title: '阅读这篇文章',
    body: { content: '保留选中文字', contentType: 'text' },
    importance: 'high',
    isReminderOn: true,
    linkedResources: [{ webUrl: 'https://example.com/article?keep=1' }],
  });
  expect(body?.reminderDateTime).toMatchObject({ timeZone: 'UTC' });
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
  await reopened.goto(`${extensionUrl}/capture.html`);
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
  expect(attempts).toBe(1);
});

test('finishes a submission after its editor window closes', async ({ context, worker }) => {
  await routeLists(context);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reached!: () => void;
  const received = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await context.route('**/lists/list-1/tasks', async (route) => {
    reached();
    await gate;
    await route.fulfill({ json: { id: 'task-after-close', title: 'Test' } });
  });
  const page = await openCaptured(context, worker);
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await received;
  await page.close();
  release();
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
  await reopened.goto(`${extensionUrl}/capture.html`);
  await expect(reopened.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
});

test('asks before replacing an unfinished draft with a different capture', async ({ context, worker }) => {
  await routeLists(context);
  const first = await openCaptured(context, worker, '原来的草稿');
  await first.getByLabel('任务', { exact: true }).fill('已修改的草稿');
  await expect(first.getByRole('status').last()).toContainText('草稿已保存在本机');
  const id = randomUUID();
  await worker.evaluate(async (id) => {
    await chrome.storage.session.set({ [`v2:capture:${id}`]: { title: '新的网页', note: '' } });
  }, id);
  const second = await context.newPage();
  await second.goto(`${extensionUrl}/capture.html?capture=${id}`);
  await expect(second.getByText('还有一份未提交的草稿。')).toBeVisible();
  await expect(second.getByLabel('任务', { exact: true })).toHaveValue('已修改的草稿');
  await second.getByRole('button', { name: '使用新内容' }).click();
  await expect(second.getByLabel('任务', { exact: true })).toHaveValue('新的网页');
});

test('supports English and dark mode and fits a narrow editor', async ({ context, worker }) => {
  await routeLists(context);
  const page = await openCaptured(context, worker);
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: '设置', exact: true }).click();
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

test('removes the source from both persistent draft and Graph payload', async ({ context, worker }) => {
  await routeLists(context);
  let body: Record<string, unknown> | undefined;
  await context.route('**/lists/list-1/tasks', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { id: 'task-without-source', title: body!.title } });
  });
  const page = await openCaptured(context, worker);
  await page.getByRole('button', { name: '移除来源网页' }).click();
  await page.getByRole('button', { name: '＋ 添加任务' }).click();
  await expect(page.getByRole('heading', { name: '已添加到 Microsoft To Do' })).toBeVisible();
  expect(body?.linkedResources).toBeUndefined();
});

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
