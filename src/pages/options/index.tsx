import React, { Suspense, useEffect } from 'react';
import { render } from 'react-dom';
import { initSentry, initGTM, timing } from '../../helpers/report';
import { Page } from '../../constants/enums';
import { storeWrap } from '../../helpers/theme';
import OptionsForm from './components/OptionsForm';
import Badges from './components/Badges';
import { Container, Grid } from '@material-ui/core';
import { PersistGate } from 'redux-persist/integration/react';
import { backgroundContext } from '../../helpers/background';
import '../../styles/style.css';

initSentry(Page.OPTIONS);
initGTM();

const OptionsPage = storeWrap(() => {
  const { persistor } = backgroundContext;

  useEffect(() => {
    timing('options rendered', performance.now())
  }, [])

  return (
    <PersistGate loading={null} persistor={persistor}>
      <Container disableGutters maxWidth="sm">
        <Grid container spacing={3}>
          <OptionsForm />

          <Grid container item>
            <Grid item>
              <Badges />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </PersistGate>
  );
});

render(
  <Suspense fallback={<div>Loading ...</div>}>
    <OptionsPage />
  </Suspense>,
  document.getElementById('root')
);
