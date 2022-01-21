import { store } from '../redux';
import { acquireTokenSilent } from '../redux/auth';
import { initQuickAdd } from './quickAdd';

export const onPresistReady = () => {
  initQuickAdd();
  store.dispatch(acquireTokenSilent());
};
