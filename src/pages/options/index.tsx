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
import UserInfo from '../../components/UserInfo';
import '../../styles/style.css';
import { useSelector } from 'react-redux';
import { State } from '../../redux';
import Login from '../../components/Login';
import Logout from '../../components/Logout';

initSentry(Page.OPTIONS);
initGTM();

const OptionsPage = storeWrap(() => {
  const { persistor } = backgroundContext;
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  useEffect(() => {
    timing('options rendered', performance.now());
  }, []);

  return (
    <PersistGate loading={null} persistor={persistor}>
      <Container disableGutters maxWidth="sm">
        <Grid container spacing={3}>
          <Grid container item justifyContent="space-between">
            <Grid item>{account && <UserInfo />}</Grid>
            <Grid item>{account ? <Logout /> : <Login />}</Grid>
          </Grid>

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
