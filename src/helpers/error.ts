import { SerializError } from '../../types';
import { ErrorCode } from '../constants/enums';
import { logger } from './logger';
import { report } from './report';

export default class AppError extends Error {
  code: ErrorCode;
  time: number;

  /**
   * 优先使用传入的 error message
   */
  constructor({ code, message }: { code: ErrorCode; message?: string }) {
    super(message || 'UNKNOW');
    this.time = Date.now();
    this.code = code;

    logger.warn(`Error code: ${this.code}\n`, this);
    report(this);
  }

  serializ(): SerializError {
    return {
      code: this.code,
      message: this.message,
      stack: this.stack,
      time: this.time,
    };
  }
}
