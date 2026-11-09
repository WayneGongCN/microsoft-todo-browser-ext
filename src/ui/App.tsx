import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ANALYTICS_CLIENT_KEY } from '../core/analytics';
import { captureActivePage } from '../core/capture';
import { AppError } from '../core/errors';
import type { ErrorCode } from '../core/errors';
import { hasContent, MAX_NOTE_LENGTH } from '../core/model';
import type { Draft, Fields, Preferences, Receipt } from '../core/model';
import type { TodoList } from '../core/graph';
import { send } from '../core/protocol';
import type { Snapshot } from '../core/protocol';
import { messages } from './i18n';
import styles from './App.module.css';

type Mode = 'popup' | 'capture' | 'options';

const rewardUrl =
  'https://reward.waynegong.com/?utm_source=microsoft-todo-browser-ext&utm_medium=referral&utm_campaign=todo-capture-reward';

/** 为快速捕获和右键编辑提供同一份表单、草稿状态与提交反馈，喵~ */
export function App({ mode }: { mode: Mode }) {
  const [state, setState] = useState<Snapshot>();
  const [form, setForm] = useState<Fields>({
    title: '',
    note: '',
    listId: '',
    important: false,
    reminder: '',
  });
  const [busy, setBusy] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [error, setError] = useState<AppError>();
  const [expanded, setExpanded] = useState(mode === 'capture');
  const [settings, setSettings] = useState(mode === 'options');
  const [accountChanged, setAccountChanged] = useState(false);
  const [pageUnavailable, setPageUnavailable] = useState(false);
  const draftRef = useRef<Draft | undefined>(undefined);
  const accountRef = useRef('guest');
  const fieldsRef = useRef(form);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const queuedWrites = useRef(0);
  const authAction = useRef(false);
  const language = state?.preferences.language ?? 'system';
  const theme = state?.preferences.theme ?? 'system';
  const text = messages(language);
  const receipt = state?.receipt;
  const locked = busy || accountChanged || receipt?.status === 'sending' || receipt?.status === 'unknown';
  const failed =
    error ??
    (receipt?.status === 'failed'
      ? new AppError(
          (receipt.error?.code as ErrorCode) ?? 'network',
          receipt.error?.detail,
          receipt.error?.retryAfter,
        )
      : undefined);

  /** 用后台快照恢复身份、草稿与回执，界面不持有令牌，喵~ */
  const apply = useCallback((next: Snapshot) => {
    accountRef.current = next.accountId;
    draftRef.current = next.draft;
    fieldsRef.current = next.draft;
    setForm(next.draft);
    setState(next);
    setSaveFailed(false);
    setAccountChanged(false);
  }, []);

  /** 逐次发送本机保存命令，关闭弹窗后后台仍可完成已收到的写入，喵~ */
  const persist = useCallback((fields: Fields): Promise<void> => {
    const expectedAccount = accountRef.current;
    const expectedDraft = draftRef.current?.id;
    queuedWrites.current++;
    setSaving(true);
    const pending = queue.current
      .catch(() => undefined)
      .then(async () => {
        const draft = draftRef.current;
        if (!draft || draft.id !== expectedDraft || accountRef.current !== expectedAccount)
          throw new AppError('conflict');
        const saved = await send<Draft>({
          type: 'save',
          accountId: expectedAccount,
          draftId: draft.id,
          revision: draft.revision,
          fields,
        });
        draftRef.current = saved;
        setSaveFailed(false);
      })
      .catch((problem: unknown) => {
        setSaveFailed(true);
        setError(problem instanceof AppError ? problem : new AppError('storage'));
        throw problem;
      })
      .finally(() => {
        queuedWrites.current--;
        if (queuedWrites.current === 0) setSaving(false);
      });
    queue.current = pending;
    return pending;
  }, []);

  /** 编辑仅改变用户指定字段，同时提交持久化请求，喵~ */
  const edit = useCallback(
    (change: Partial<Fields>) => {
      const next = { ...fieldsRef.current, ...change };
      fieldsRef.current = next;
      setForm(next);
      setError(undefined);
      void persist(next).catch(() => undefined);
    },
    [persist],
  );

  /** 读取清单并仅在尚未选定目标时设置默认值，喵~ */
  const loadLists = useCallback(
    async (snapshot: Snapshot, force = false) => {
      if (!snapshot.account) return;
      setLoadingLists(true);
      try {
        const result = await send<TodoList[]>({ type: 'lists', accountId: snapshot.accountId, force });
        if (accountRef.current !== snapshot.accountId) return;
        setState((previous) => (previous ? { ...previous, lists: result } : previous));
        if (!fieldsRef.current.listId && result.length) {
          const first =
            result.find((list) => list.id === snapshot.preferences.defaultListId) ??
            result.find((list) => list.wellknownListName === 'defaultList') ??
            result[0]!;
          edit({ listId: first.id });
        }
      } catch (problem) {
        setError(problem instanceof AppError ? problem : new AppError('network'));
      } finally {
        setLoadingLists(false);
      }
    },
    [edit],
  );

  /** 用户主动登录后恢复其隔离草稿，来宾内容由后台安全接续，喵~ */
  async function signIn() {
    setBusy(true);
    setError(undefined);
    authAction.current = true;
    try {
      await queue.current;
      const next = await send<Snapshot>({ type: 'login' });
      apply(next);
      await loadLists(next);
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('network'));
    } finally {
      authAction.current = false;
      setBusy(false);
    }
  }

  /** 退出仅清理本扩展会话，界面随即切回独立的来宾草稿，喵~ */
  async function signOut() {
    setBusy(true);
    authAction.current = true;
    try {
      await queue.current;
      apply(await send<Snapshot>({ type: 'logout' }));
      setError(undefined);
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('network'));
    } finally {
      authAction.current = false;
      setBusy(false);
    }
  }

  /** 保存完当前草稿后提交其固定版本，网络结果不明时保留内容，喵~ */
  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!state || locked) return;
    if (!state.account) {
      await signIn();
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await queue.current;
      if (saveFailed) throw new AppError('storage');
      if (!fieldsRef.current.title.trim() || !fieldsRef.current.listId) throw new AppError('invalid');
      if (receipt?.status === 'failed') await persist(fieldsRef.current);
      const current = draftRef.current!;
      const result = await send<Receipt>({
        type: 'submit',
        accountId: accountRef.current,
        draftId: current.id,
        revision: current.revision,
      });
      apply(await send<Snapshot>({ type: 'bootstrap' }));
      if (result.status === 'failed')
        setError(
          new AppError(
            (result.error?.code as ErrorCode) ?? 'network',
            result.error?.detail,
            result.error?.retryAfter,
          ),
        );
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('network'));
      if (problem instanceof AppError && problem.code === 'network') {
        try {
          apply(await send<Snapshot>({ type: 'bootstrap' }));
        } catch {
          /* 保留本窗口当前输入，等待后台恢复，喵~ */
        }
      }
    } finally {
      setBusy(false);
    }
  }

  /** 只有用户明确选择后才丢弃草稿或解除待确认结果，喵~ */
  async function action(type: 'new' | 'acknowledge' | 'confirm_absent' | 'confirm_present') {
    if (!state || !draftRef.current) return;
    if (type === 'new' && hasContent(form) && !window.confirm(text.clearConfirm)) return;
    setBusy(true);
    try {
      await queue.current;
      const draft = draftRef.current!;
      apply(
        await send<Snapshot>({
          type,
          accountId: accountRef.current,
          draftId: draft.id,
          revision: draft.revision,
        }),
      );
      setError(undefined);
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('network'));
    } finally {
      setBusy(false);
    }
  }

  /** 新收集内容替换当前草稿前必须经过明确选择，喵~ */
  async function acceptCapture() {
    if (!state?.candidate && !state?.guestDraft) return;
    setBusy(true);
    try {
      await queue.current;
      const draft = draftRef.current!;
      const base = {
        accountId: accountRef.current,
        draftId: draft.id,
        revision: draft.revision,
      };
      const saved = state.guestDraft
        ? await send<Draft>({ type: 'restore_guest', ...base })
        : await send<Draft>({
            type: 'capture',
            ...base,
            capture: state.candidate!,
          });
      apply({ ...state, draft: saved, candidate: undefined, guestDraft: undefined });
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('network'));
    } finally {
      setBusy(false);
    }
  }

  /** 偏好保存成功后更新主题和清单策略，错误时保留原设置，喵~ */
  async function savePreferences(change: Partial<Preferences>) {
    if (!state) return;
    try {
      const prefs = await send<Preferences>({
        type: 'preferences',
        accountId: state.accountId,
        preferences: { ...state.preferences, ...change },
      });
      setState((previous) => (previous ? { ...previous, preferences: prefs } : previous));
      setError(undefined);
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('storage'));
    }
  }

  /** 统计偏好独立于其他设置，旧窗口保存其他选项时不会覆盖它。 */
  async function updateAnalytics(enabled: boolean) {
    try {
      const analyticsEnabled = await send<boolean>({ type: 'analytics_consent', enabled });
      setState((previous) => (previous ? { ...previous, analyticsEnabled } : previous));
      setError(undefined);
    } catch (problem) {
      setError(problem instanceof AppError ? problem : new AppError('storage'));
    }
  }

  /** 首次打开时冻结采集来源，之后切换标签页不会改写草稿，喵~ */
  useEffect(() => {
    let mounted = true;
    for (const key of Object.keys(localStorage)) {
      if (
        key.startsWith('msal.') ||
        key.includes('a5491fb2-111a-4c43-976c-280a507814dc') ||
        key.includes('07171723-a302-4e3c-875d-197490f956eb')
      )
        localStorage.removeItem(key);
    }
    const captureId = new URL(location.href).searchParams.get('capture') ?? undefined;
    void (async () => {
      const capture = mode === 'popup' ? await captureActivePage().catch(() => undefined) : undefined;
      if (mounted) setPageUnavailable(mode === 'popup' && !capture);
      let snapshot: Snapshot;
      let captureFailure: AppError | undefined;
      try {
        snapshot = await send<Snapshot>({
          type: 'bootstrap',
          ...(captureId ? { captureId } : { capture }),
        });
      } catch (problem) {
        if (!(problem instanceof AppError) || problem.code !== 'capture_too_large') throw problem;
        snapshot = await send<Snapshot>({ type: 'bootstrap' });
        captureFailure = problem;
      }
      if (!mounted) return;
      apply(snapshot);
      void send({ type: 'analytics_open' }).catch(() => undefined);
      await loadLists(snapshot);
      if (mounted && captureFailure) setError(captureFailure);
    })().catch((problem: unknown) => {
      if (mounted) setError(problem instanceof AppError ? problem : new AppError('network'));
    });
    return () => {
      mounted = false;
    };
  }, [mode, apply, loadLists]);

  /** 应用明确主题及语言，系统模式由 CSS 色彩方案跟随系统，喵~ */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang =
      language === 'en'
        ? 'en'
        : language === 'zh_CN' || chrome.i18n.getUILanguage().startsWith('zh')
          ? 'zh-CN'
          : 'en';
  }, [theme, language]);

  /** 回执变更时恢复结果，账号变更只通知用户而不覆盖当前输入，喵~ */
  useEffect(() => {
    const changed = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[ANALYTICS_CLIENT_KEY]) {
        const analyticsEnabled = typeof changes[ANALYTICS_CLIENT_KEY].newValue === 'string';
        setState((previous) => (previous ? { ...previous, analyticsEnabled } : previous));
      }
      if (!changes[`v2:receipt:${accountRef.current}`]) return;
      void queue.current
        .then(async () => {
          const latest = await send<Snapshot>({ type: 'bootstrap' });
          if (latest.accountId === accountRef.current) apply(latest);
        })
        .catch(() => undefined);
    };
    const session = (message: unknown, sender: chrome.runtime.MessageSender) => {
      if (
        sender.id !== chrome.runtime.id ||
        !message ||
        typeof message !== 'object' ||
        !('type' in message) ||
        message.type !== 'session_changed' ||
        authAction.current
      )
        return;
      const next = 'accountId' in message ? message.accountId : 'guest';
      if (next !== accountRef.current) setAccountChanged(true);
    };
    chrome.storage.local.onChanged.addListener(changed);
    chrome.runtime.onMessage.addListener(session);
    return () => {
      chrome.storage.local.onChanged.removeListener(changed);
      chrome.runtime.onMessage.removeListener(session);
    };
  }, [apply]);

  const todoUrl =
    state?.account?.tenantId === '9188040d-6c67-4c5b-b112-36a304b66dad'
      ? 'https://to-do.live.com/tasks/'
      : 'https://to-do.office.com/tasks/';
  const errorMessage = failed ? (text.errors[failed.code] ?? text.errors.network) : '';

  if (!state)
    return (
      <main className={styles.boot} aria-live="polite">
        <h1>{text.app}</h1>
        <p>{errorMessage || text.loading}</p>
        {error && (
          <button
            onClick={() => {
              void send<Snapshot>({ type: 'bootstrap' })
                .then(apply)
                .catch(() => undefined);
            }}
          >
            {text.reload}
          </button>
        )}
      </main>
    );

  return (
    <main className={`${styles.shell} ${mode === 'popup' ? styles.popup : styles.window}`}>
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          ✓
        </span>
        <div>
          <h1>{text.app}</h1>
          <p>{settings ? text.settings : text.tagline}</p>
        </div>
        <button
          className={styles.iconButton}
          aria-label={settings ? text.close : text.settings}
          onClick={() => setSettings(!settings)}
        >
          {settings ? '×' : '⚙'}
        </button>
      </header>
      {accountChanged && (
        <section className={styles.notice} role="alert">
          <p>{text.changed}</p>
          <button onClick={() => location.reload()}>{text.reload}</button>
        </section>
      )}
      {failed && (
        <section className={styles.error} role="alert">
          <p>
            {errorMessage}
            {failed.retryAfter ? ` (${failed.retryAfter}s)` : ''}
          </p>
          {saveFailed && (
            <button
              onClick={() => {
                void persist(fieldsRef.current).catch(() => undefined);
              }}
            >
              {text.retrySave}
            </button>
          )}
          {failed.code === 'auth_required' && (
            <button
              disabled={busy}
              onClick={() => {
                void signIn();
              }}
            >
              {text.login}
            </button>
          )}
        </section>
      )}
      {pageUnavailable && !settings && (
        <p className={styles.notice} role="status">
          {text.notAvailable}
        </p>
      )}
      {settings ? (
        <section className={styles.settings}>
          <div className={styles.account}>
            <span className={styles.avatar}>{state.account?.name.slice(0, 1) ?? 'M'}</span>
            <div>
              <strong>{state.account?.name ?? text.account}</strong>
              <p>{state.account?.username ?? text.loginHint}</p>
            </div>
          </div>
          <button
            disabled={busy || receipt?.status === 'sending'}
            onClick={() => {
              void (state.account ? signOut() : signIn());
            }}
          >
            {state.account ? text.logout : text.login}
          </button>
          <hr />
          <label>
            {text.appearance}
            <select
              aria-label={text.appearance}
              value={state.preferences.theme}
              onChange={(event) => {
                void savePreferences({ theme: event.target.value as Preferences['theme'] });
              }}
            >
              <option value="system">{text.system}</option>
              <option value="light">{text.light}</option>
              <option value="dark">{text.dark}</option>
            </select>
          </label>
          <label>
            {text.language}
            <select
              aria-label={text.language}
              value={state.preferences.language}
              onChange={(event) => {
                void savePreferences({ language: event.target.value as Preferences['language'] });
              }}
            >
              <option value="system">{text.system}</option>
              <option value="zh_CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={state.preferences.attachSource}
              onChange={(event) => {
                void savePreferences({ attachSource: event.target.checked });
              }}
            />
            {text.attachDefault}
          </label>
          <label>
            {text.target}
            <select
              value={state.preferences.listMode}
              onChange={(event) => {
                void savePreferences({ listMode: event.target.value as Preferences['listMode'] });
              }}
            >
              <option value="recent">{text.recent}</option>
              <option value="fixed">{text.fixed}</option>
            </select>
          </label>
          {state.preferences.listMode === 'fixed' && (
            <label>
              {text.chooseList}
              <select
                disabled={!state.account}
                value={state.preferences.defaultListId}
                onChange={(event) => {
                  void savePreferences({ defaultListId: event.target.value });
                }}
              >
                <option value="">{text.chooseList}</option>
                {state.lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.displayName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className={styles.muted}>{text.session}</p>
          <label className={styles.check}>
            <input
              type="checkbox"
              aria-describedby="analytics-privacy"
              checked={state.analyticsEnabled}
              onChange={(event) => {
                void updateAnalytics(event.target.checked);
              }}
            />
            {text.analytics}
          </label>
          <p className={styles.muted} id="analytics-privacy">
            {text.privacy}
          </p>
          <p className={styles.muted}>{text.independent}</p>
          <a
            href="https://github.com/WayneGongCN/microsoft-todo-browser-ext"
            target="_blank"
            rel="noreferrer"
          >
            {text.website} ↗
          </a>
          <a className={styles.rewardLink} href={rewardUrl} target="_blank" rel="noreferrer">
            {text.reward}
          </a>
        </section>
      ) : receipt?.status === 'succeeded' ? (
        <section className={styles.success} aria-live="polite">
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          <h2>{text.success}</h2>
          <p>{text.successHint}</p>
          <a className={styles.primaryLink} href={todoUrl} target="_blank" rel="noreferrer">
            {text.openTodo} ↗
          </a>
          <button
            onClick={() => {
              void action('acknowledge');
            }}
          >
            {text.another}
          </button>
        </section>
      ) : (
        <>
          {(state.candidate || state.guestDraft) && (
            <section className={styles.notice}>
              <strong>{text.captureConflict}</strong>
              <p>{text.captureHint}</p>
              <div className={styles.actions}>
                <button
                  disabled={locked}
                  onClick={() => {
                    void action('acknowledge');
                  }}
                >
                  {text.keep}
                </button>
                <button
                  disabled={locked}
                  onClick={() => {
                    void acceptCapture();
                  }}
                >
                  {text.replace}
                </button>
              </div>
            </section>
          )}
          {receipt?.status === 'unknown' && (
            <section className={styles.notice} role="alert">
              <strong>{text.unknown}</strong>
              <p>{text.unknownHint}</p>
              <a href={todoUrl} target="_blank" rel="noreferrer">
                {text.openTodo} ↗
              </a>
              <button
                disabled={busy}
                onClick={() => {
                  void action('confirm_present');
                }}
              >
                {text.present}
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  void action('confirm_absent');
                }}
              >
                {text.absent}
              </button>
            </section>
          )}
          {receipt?.status === 'sending' && (
            <section className={styles.notice} role="status">
              <strong>{text.pending}</strong>
              <p>{text.pendingHint}</p>
            </section>
          )}
          <form
            className={styles.form}
            onSubmit={(event) => {
              void submit(event);
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                void submit();
              }
            }}
          >
            <label className={styles.titleLabel}>
              <span className={styles.srOnly}>{text.task}</span>
              <input
                className={styles.title}
                name="title"
                aria-label={text.task}
                placeholder={text.placeholder}
                value={form.title}
                maxLength={255}
                required={Boolean(state.account)}
                disabled={locked}
                onChange={(event) => edit({ title: event.target.value })}
                autoFocus
              />
            </label>
            <div className={styles.listRow}>
              <label htmlFor="target-list">{text.list}</label>
              <select
                id="target-list"
                name="list"
                value={form.listId}
                disabled={locked || !state.account || loadingLists}
                onChange={(event) => edit({ listId: event.target.value })}
              >
                <option value="">
                  {loadingLists
                    ? text.loading
                    : state.account && state.lists.length === 0
                      ? text.noLists
                      : text.chooseList}
                </option>
                {form.listId && !state.lists.some((list) => list.id === form.listId) && (
                  <option value={form.listId}>{text.errors.not_found}</option>
                )}
                {state.lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.displayName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={text.refresh}
                disabled={!state.account || locked || loadingLists}
                onClick={() => {
                  setError(undefined);
                  void loadLists(state, true);
                }}
              >
                ↻
              </button>
            </div>
            {form.source && (
              <div className={styles.source}>
                <span aria-hidden="true">↗</span>
                <a href={form.source.url} target="_blank" rel="noreferrer" title={form.source.url}>
                  <strong>{form.source.title || new URL(form.source.url).hostname}</strong>
                  <small>{new URL(form.source.url).hostname}</small>
                </a>
                <button
                  className={styles.iconButton}
                  type="button"
                  aria-label={text.removeSource}
                  disabled={locked}
                  onClick={() => edit({ source: undefined })}
                >
                  ×
                </button>
              </div>
            )}
            <button
              className={styles.more}
              type="button"
              aria-expanded={expanded}
              aria-controls="task-details"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '−' : '+'} {expanded ? text.less : text.more}
            </button>
            <div id="task-details" className={styles.details} hidden={!expanded}>
              <label>
                {text.note}
                <textarea
                  name="note"
                  value={form.note}
                  placeholder={text.notePlaceholder}
                  maxLength={MAX_NOTE_LENGTH}
                  rows={2}
                  disabled={locked}
                  onChange={(event) => edit({ note: event.target.value })}
                />
              </label>
              <div className={styles.options}>
                <label className={styles.check}>
                  <input
                    name="important"
                    type="checkbox"
                    checked={form.important}
                    disabled={locked}
                    onChange={(event) => edit({ important: event.target.checked })}
                  />
                  {text.important}
                </label>
                <label className={styles.reminder}>
                  {text.reminder}
                  <input
                    name="reminder"
                    type="datetime-local"
                    value={form.reminder}
                    disabled={locked}
                    onChange={(event) => edit({ reminder: event.target.value })}
                  />
                </label>
              </div>
            </div>
            <button
              className={styles.primary}
              type="submit"
              disabled={
                locked ||
                saveFailed ||
                Boolean(
                  state.account &&
                  (!form.title.trim() ||
                    !form.listId ||
                    !state.lists.some((list) => list.id === form.listId)),
                )
              }
            >
              {busy || receipt?.status === 'sending'
                ? text.adding
                : state.account
                  ? `＋ ${text.add}`
                  : text.signInContinue}
            </button>
            {hasContent(form) && !locked && (
              <button
                className={styles.clear}
                type="button"
                onClick={() => {
                  void action('new');
                }}
              >
                {text.clear}
              </button>
            )}
          </form>
        </>
      )}
      <footer className={styles.footer}>
        <span>{state.account?.username || 'Microsoft To Do'}</span>
        <span role="status">{saveFailed ? text.unsaved : saving ? text.saving : text.saved}</span>
      </footer>
    </main>
  );
}
