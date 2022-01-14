import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { logger } from '../helpers/logger';
import { themeWrap } from '../themes';
import report from '../helpers/report';
import { EThemes, Page } from '../constants/enums';
import Container from '@material-ui/core/Container';
import gtm from '../helpers/gtm';

report(Page.POPUP);
gtm();

const themeName = EThemes.DEFAULT;
logger.log('theme: ', themeName);
const Theme = themeWrap(themeName);

render(
  <Container disableGutters style={{ width: 350, padding: 10 }}>
    <Suspense fallback={<div>Loading ...</div>}>
      <Theme />
    </Suspense>
  </Container>,
  document.getElementById('root')
);
