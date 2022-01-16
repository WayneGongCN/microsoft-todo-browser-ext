import React from 'react';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { EThemes } from '../constants/enums';
import { getBackgroundCtx } from './background';
import { timing } from './report';

/**
 * 异步加载 Theme
 * @param theme
 * @returns
 */
export const loadTheme = (theme: EThemes) => {
  return lazy(() =>
    import(`../themes/${theme}/`).then(async (res) => {
      timing('theme loaded', performance.now());
      return res;
    })
  );
};

/**
 * 为 Component 包裹 Provider store
 * @param theme
 * @returns
 */
export const storeWrap = (Component: React.LazyExoticComponent<React.ComponentType<any>> | React.FC) => {
  return lazy(async () => {
    const backgroundContext = await getBackgroundCtx();
    return {
      default: () => (
        <Provider store={backgroundContext.store}>
          <Component />
        </Provider>
      ),
    } as never;
  });
};
