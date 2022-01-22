import React, { Suspense, useCallback, useEffect } from 'react';
import { render } from 'react-dom';
import { initSentry, initGTM, timing, now } from '../../helpers/report';
import { Page } from '../../constants/enums';
import { storeWrap } from '../../helpers/theme';
import OptionsForm from './components/OptionsForm';
import { Button, Container, Divider, Grid } from '@material-ui/core';
import { PersistGate } from 'redux-persist/integration/react';
import { backgroundContext } from '../../helpers/background';
import UserInfo from '../../components/UserInfo';
import '../../styles/style.css';
import { useSelector } from 'react-redux';
import { State } from '../../redux';
import Login from '../../components/Login';
import Logout from '../../components/Logout';
import OpenMSTodo from '../../components/OpenMSToDo';
import { LANG_OPTIONS_ISSUE, LANG_OPTIONS_RATE } from '../../constants/lang';
import { EXT_URL, ISSUE_URL, RATE_URL, REPO_URL } from '../../constants';
import BuyMeACoffee from './components/BuyMeACoffee';
import { openUrl } from '../../helpers';

initSentry(Page.OPTIONS);
initGTM();

const OptionsPage = storeWrap(() => {
  const { persistor } = backgroundContext;
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
  }, []);

  return (
    <PersistGate loading={null} persistor={persistor}>
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
    </PersistGate>
  );
});

render(
  <Suspense fallback={<div>Loading ...</div>}>
    <OptionsPage />
  </Suspense>,
  document.getElementById('root')
);
