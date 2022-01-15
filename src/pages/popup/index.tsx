import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { EThemes, Page } from '../../constants/enums';
import { loadTheme, storeWrap } from '../../helpers/theme';
import { initSentry, initGTM } from '../../helpers/report';
import { Container } from '@material-ui/core';
import './../../styles/style.css'

initSentry(Page.POPUP);
initGTM();

const themeName = EThemes.DEFAULT;
const Theme = storeWrap(loadTheme(themeName));

render(
  <Container disableGutters style={{ width: 350, padding: 10 }}>
    <Suspense fallback={<div>Loading ...</div>}>
      <Theme />
    </Suspense>
  </Container>,
  document.getElementById('root')
);
