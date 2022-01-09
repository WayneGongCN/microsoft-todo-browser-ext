import React, { Suspense } from 'react';
import { render } from 'react-dom';
import report from '../../helpers/report';
import { Page } from '../../constants/enums';
import { storeWrap } from '../../helpers/loader';
import OptionsForm from './components/OptionsForm';
import Badges from './components/Badges';
import { Container, Grid } from '@material-ui/core';

report(Page.OPTIONS);

const OptionsPage = storeWrap(() => (
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
));

render(
  <Suspense fallback={<div>Loading ...</div>}>
    <OptionsPage />
  </Suspense>,
  document.getElementById('root')
);
