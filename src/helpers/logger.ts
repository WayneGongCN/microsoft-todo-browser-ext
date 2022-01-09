import { IS_DEV } from '../constants';

const LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];
type LogLevel = 'error' | 'warn' | 'info' | 'log' | 'debug';

const nothing = (): void => undefined;
const loggerWrap = (logger: Console) => (level: LogLevel) => IS_DEV ? logger[level] : nothing;

export const logger = LOG_LEVELS.reduce((logger, level: LogLevel) => {
  logger[level] = loggerWrap(logger)(level);
  return logger as typeof logger;
}, console);
