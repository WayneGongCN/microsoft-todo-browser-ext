import React, { useCallback, useEffect } from 'react';
import { Container, Grid, Button } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Login from '../../components/Login';
import Logout from '../../components/Logout';
import OpenMSTodo from '../../components/OpenMSToDo';
import TranslateTip from '../../components/TranslateTip';
import UserInfo from '../../components/UserInfo';
import { EXT_URL, ISSUE_URL, RATE_URL, REPO_URL } from '../../constants';
import { Page } from '../../constants/enums';
import { LANG_OPTIONS_ISSUE, LANG_OPTIONS_RATE } from '../../constants/lang';
import { openUrl } from '../../helpers';
import { timing, now, initReport } from '../../helpers/report';
import { persistor, State } from '../../redux';
import BuyMeACoffee from './components/BuyMeACoffee';
import OptionsForm from './components/OptionsForm';

export const App = () => {
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  // btn
  const handleBtnClick = useCallback((e) => {
    const url = e.target?.dataset?.url;
    url && openUrl({ url });
  }, []);

  // badges
  const badgePrefix = `https://img.shields.io`;
  const badgesUrl = [
    {
      name: 'version',
      img: `${badgePrefix}/chrome-web-store/v/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: EXT_URL,
    },
    {
      name: 'users',
      img: `${badgePrefix}/chrome-web-store/users/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: EXT_URL,
    },
    {
      name: 'rating',
      img: `${badgePrefix}/chrome-web-store/stars/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: RATE_URL,
    },
    {
      name: 'stars',
      img: `${badgePrefix}/github/stars/waynegongcn/microsoft-todo-browser-ext?style=social`,
      url: REPO_URL,
    },
    {
      name: 'issues',
      img: `${badgePrefix}/github/issues/waynegongcn/microsoft-todo-browser-ext?style=social`,
      url: ISSUE_URL,
    },
  ];

  useEffect(() => {
    timing('options rendered', now());
    initReport(Page.OPTIONS);
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
          <Grid item>
            <Button id="options-btn-issue" variant="contained" data-url={ISSUE_URL} onClick={handleBtnClick}>
              {LANG_OPTIONS_ISSUE}
            </Button>
          </Grid>

          <Grid item>
            <Button id="options-btn-rate" variant="contained" data-url={RATE_URL} onClick={handleBtnClick}>
              {LANG_OPTIONS_RATE}
            </Button>
          </Grid>

          <Grid item>
            <BuyMeACoffee />
          </Grid>

          <TranslateTip />
        </Grid>

        <Grid container justifyContent="flex-end" item xs={12} lg={12} spacing={2}>
          {badgesUrl.map((x) => (
            <Grid item key={x.name}>
              <a href={x.url} target="_blank" rel="noreferrer">
                <img id={`options-badge-${x.name}`} src={x.img} />
              </a>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};
