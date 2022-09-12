const LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];
type LogLevel = 'error' | 'warn' | 'info' | 'log' | 'debug';


const loggerWrap = (logger: Console) => (level: LogLevel) => logger[level];


export const logger = LOG_LEVELS.reduce((logger, level: LogLevel) => {
  logger[level] = loggerWrap(logger)(level);
  return logger as typeof logger;
}, console);