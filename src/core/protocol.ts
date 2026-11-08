import type { Account } from './auth';
import type { TodoList } from './graph';
import type { Capture, Draft, Fields, Preferences, Receipt } from './model';
import { AppError } from './errors';

export interface Snapshot {
  account?: Account;
  accountId: string;
  draft: Draft;
  preferences: Preferences;
  lists: TodoList[];
  receipt?: Receipt;
  candidate?: Capture;
  guestDraft?: Draft;
}
export type Request =
  | { type: 'bootstrap'; capture?: Capture; captureId?: string }
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'lists'; accountId: string; force?: boolean }
  | { type: 'save'; accountId: string; draftId: string; revision: number; fields: Fields }
  | { type: 'submit'; accountId: string; draftId: string; revision: number }
  | {
      type: 'capture';
      accountId: string;
      draftId: string;
      revision: number;
      capture: Capture;
      captureId?: string;
    }
  | { type: 'preferences'; accountId: string; preferences: Preferences }
  | { type: 'new'; accountId: string; draftId: string; revision: number }
  | { type: 'acknowledge'; accountId: string; draftId: string; revision: number }
  | { type: 'confirm_present'; accountId: string; draftId: string; revision: number }
  | { type: 'restore_guest'; accountId: string; draftId: string; revision: number }
  | { type: 'confirm_absent'; accountId: string; draftId: string; revision: number };

/** 将明确业务命令交给后台，Promise 仅在后台完成后兑现，失败以公开错误分类拒绝，喵~ */
export async function send<T>(message: Request): Promise<T> {
  let response;
  try {
    response = await chrome.runtime.sendMessage(message);
  } catch {
    throw new AppError('network');
  }
  if (!response?.ok)
    throw new AppError(
      response?.error?.code ?? 'network',
      response?.error?.detail,
      response?.error?.retryAfter,
    );
  return response.data as T;
}
