import { store } from '../redux';
import { acquireToken } from '../redux/auth';
import { initQuickAdd } from './quickAdd';

export const onPresistReady = () => {
  initQuickAdd();
  store.dispatch(acquireToken(true));
};
