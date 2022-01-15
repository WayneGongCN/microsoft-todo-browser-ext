import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { initSentry, initGTM } from '../../helpers/report';
import { Page } from '../../constants/enums';
import { storeWrap } from '../../helpers/theme';
import OptionsForm from './components/OptionsForm';
import Badges from './components/Badges';
import { Container, Grid } from '@material-ui/core';
import { persistor } from '../../redux';
import { PersistGate } from 'redux-persist/integration/react'
import '../../styles/style.css';


initSentry(Page.OPTIONS);
initGTM();

const OptionsPage = storeWrap(() => (
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
));

render(
  <Suspense fallback={<div>Loading ...</div>}>
    <OptionsPage />
  </Suspense>,
  document.getElementById('root')
);
