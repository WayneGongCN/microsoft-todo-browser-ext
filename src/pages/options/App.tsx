import React, { useEffect } from 'react';
import { Container, Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
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
      <Grid container spacing={4}>
        <Grid container item justifyContent="flex-end" alignItems="center">
          <OpenMSTodo />
        </Grid>
        <Divider style={{ width: '100%' }} />

        <Grid container item justifyContent="space-between">
          <Grid item>{account && <UserInfo />}</Grid>
          <Grid item>{account ? <Logout /> : <Login />}</Grid>
        </Grid>

        <OptionsForm />
        <Divider style={{ width: '100%' }} />

        {/* Btns */}
        <Grid container justifyContent="flex-end" item xs={12} lg={12} spacing={2}>
          <FooterBtns />

          <TranslateTip />
        </Grid>

        <Badges />
      </Grid>
    </Container>
  );
};
