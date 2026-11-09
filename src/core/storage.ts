import { AppError } from './errors';

/** 读取扩展本机数据，不通过浏览器账号同步用户内容，喵~ */
export async function read<T>(key: string): Promise<T | undefined> {
  try {
    return (await chrome.storage.local.get(key))[key] as T | undefined;
  } catch {
    throw new AppError('storage');
  }
}

/** 完成写入后才向界面确认草稿或操作状态已经保存，喵~ */
export async function write(values: Record<string, unknown>): Promise<void> {
  try {
    await chrome.storage.local.set(values);
  } catch {
    throw new AppError('storage');
  }
}

/** 只清理本扩展指定的键，避免误删无关配置，喵~ */
export async function remove(keys: string[]): Promise<void> {
  try {
    await chrome.storage.local.remove(keys);
  } catch {
    throw new AppError('storage');
  }
}

/** 串行化短本地事务，网络请求保持在事务之外，喵~ */
export class Transactions {
  private tail: Promise<unknown> = Promise.resolve();
  /** 在上一项本地操作结束后执行，失败不会阻塞后续独立操作，喵~ */
  run<T>(action: () => Promise<T>): Promise<T> {
    const next = this.tail.then(action, action);
    this.tail = next.catch(() => undefined);
    return next;
  }
}
