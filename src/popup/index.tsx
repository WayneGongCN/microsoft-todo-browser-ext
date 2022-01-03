import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { logger } from '../helpers/logger';
import { EThemes, loadTheme } from '../themes';
import { BackgroundContext } from '../../types';
import report from '../helpers/report';
import { Page } from '../constants/enums';
import Container from '@material-ui/core/Container';

report(Page.POPUP);

export let backgroundContext: BackgroundContext;

logger.time('getBackgroundPage');
chrome.runtime.getBackgroundPage(async (ctx: Window & { backgroundContext: BackgroundContext }) => {
  logger.timeEnd('getBackgroundPage');
  logger.time('firstRender');
  logger.time('theme');
  logger.log('show popup');

  logger.log('background ctx: ', ctx);
  backgroundContext = ctx.backgroundContext;

  const themeName = EThemes.DEFAULT;
  const Theme = loadTheme(themeName);
  logger.log('theme: ', themeName);

  render(
    <Provider store={backgroundContext.store}>
      <Suspense fallback={<div>{logger.timeEnd('firstRender')}Loading</div>}>
        <Container disableGutters>
          <Theme />
        </Container>
      </Suspense>
    </Provider>,
    document.getElementById('root')
  );
});
