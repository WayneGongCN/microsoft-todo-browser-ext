import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { logger } from '../../helpers/logger';
import { EThemes, Page } from '../../constants/enums';
import { loadTheme, storeWrap } from '../../helpers/loader';
import { initSentry, initGTM } from '../../helpers/report';
import { Container } from '@material-ui/core';
import './style.css'

initSentry(Page.POPUP);
initGTM();

const themeName = EThemes.DEFAULT;
logger.log('theme: ', themeName);
const Theme = storeWrap(loadTheme(themeName));

render(
  <Container disableGutters style={{ width: 350, padding: 10 }}>
    <Suspense fallback={<div>Loading ...</div>}>
      <Theme />
    </Suspense>
  </Container>,
  document.getElementById('root')
);
