import { logger } from './logger';
import { initQuickAdd } from './quickAdd';

export const onPresistReady = () => {
  logger.log('PresistReady');
  initQuickAdd();
};
