export type ErrorCode =
  | 'auth_required'
  | 'auth_cancelled'
  | 'auth_invalid'
  | 'configuration'
  | 'network'
  | 'forbidden'
  | 'rate_limited'
  | 'not_found'
  | 'invalid'
  | 'unknown'
  | 'storage'
  | 'conflict'
  | 'busy';

/** 只传递可公开的错误分类，避免凭据或完整响应进入界面和日志，喵~ */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly detail?: string,
    public readonly retryAfter?: number,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

/** 将未知异常收敛为不含用户内容的错误，喵~ */
export function publicError(error: unknown): { code: ErrorCode; detail?: string; retryAfter?: number } {
  if (error instanceof AppError)
    return { code: error.code, detail: error.detail, retryAfter: error.retryAfter };
  return { code: 'network' };
}
