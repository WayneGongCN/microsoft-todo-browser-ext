import React, { Suspense } from 'react';
import { persistor, State, store } from '../../redux';
import { render } from 'react-dom';
import { EThemes, Page } from '../../constants/enums';
import Container from '@mui/material/Container';
import { Provider } from 'react-redux';
import { loadTheme } from '../../themes';
import { PersistGate } from 'redux-persist/es/integration/react';
import { fetchConfAction } from '../../redux/conf';
import { initReport } from '../../helpers/report';
import { initPageTitle } from '../../helpers/pageTitle';
import './../../styles/style.css';

const themeName = EThemes.DEFAULT;
const Theme = loadTheme(themeName);

render(
  <Container disableGutters style={{ width: 350, padding: 10 }}>
    <Suspense fallback={<div>Loading ...</div>}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Theme />
        </PersistGate>
      </Provider>
    </Suspense>
  </Container>,
  document.getElementById('root')
);

const init = () => {
  initPageTitle();
  store.dispatch(fetchConfAction()).then((res) => {
    const { payload } = res;
    initReport(Page.POPUP, payload as State['conf']['conf']);
  });
};
init();