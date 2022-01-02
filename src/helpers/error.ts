import { SerializError } from '../../types';

export enum ErrorCode {
  UNKNOW = -1,
  NOT_FOUND_ACCOUNT,
  ACQUIRE_TOKEN,
  ACQUIRE_TOKEN_SILENT,
}

const errorMessageMap = {
  [ErrorCode.UNKNOW]: '',
  [ErrorCode.NOT_FOUND_ACCOUNT]: '',
  [ErrorCode.ACQUIRE_TOKEN]: '',
  [ErrorCode.ACQUIRE_TOKEN_SILENT]: '',
};

export default class AppError extends Error {
  code: ErrorCode;
  time: number;

  /**
   * 优先使用传入的 error message
   */
  constructor({ code, message }: { code: ErrorCode; message?: string }) {
    super(message || errorMessageMap[code]);

    this.time = Date.now();
    this.code = code;
  }

  serializ(): SerializError {
    return {
      code: this.code,
      // 优先使用已定义过的 error message
      message: errorMessageMap[this.code] || this.message,
      stack: this.stack,
      time: this.time,
    };
  }
}
