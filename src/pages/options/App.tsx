import React, { useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { useSelector } from 'react-redux';
import Login from '../../components/Login';
import Logout from '../../components/Logout';
import OpenMSTodo from '../../components/OpenMSToDo';
import TranslateTip from '../../components/TranslateTip';
import UserInfo from '../../components/UserInfo';
import { timing, now } from '../../helpers/report';
import { State } from '../../redux';
import OptionsForm from './components/OptionsForm';
import Badges from './components/Badges';
import FooterBtns from './components/FooterBtns';

export const App = () => {
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  useEffect(() => {
    timing('options rendered', now());
  }, []);

  return (
    <Container disableGutters maxWidth="sm">
      <Grid container spacing={2}>
        <Grid container item justifyContent="flex-end" alignItems="center">
          <OpenMSTodo />
        </Grid>

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid container item justifyContent="space-between">
          <Grid item>{account && <UserInfo />}</Grid>
          <Grid item>{account ? <Logout /> : <Login />}</Grid>
        </Grid>

        <OptionsForm />

        <Grid item xs={12}>
          <Divider variant="fullWidth" />
        </Grid>

        {/* Footer */}
        <Grid container item xs={12} spacing={2}>
          <Grid container item justifyContent="flex-end" xs={12} spacing={1}>
            <FooterBtns />
          </Grid>

          <Grid container item justifyContent="flex-end" spacing={1}>
            <TranslateTip />
          </Grid>

          <Grid container item justifyContent="flex-end" spacing={1}>
            <Badges />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
