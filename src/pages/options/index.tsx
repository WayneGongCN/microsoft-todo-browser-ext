import { persistor, State, store } from '../../redux';
import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { PersistGate } from 'redux-persist/es/integration/react';
import { Provider } from 'react-redux';
import Loading from '../../components/Loading';
import { fetchConf } from '../../redux/conf';
import { initReport } from '../../helpers/report';
import { Page } from '../../constants/enums';
import '../../styles/style.css';

render(
  <Suspense fallback={<Loading />}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </Suspense>,
  document.getElementById('root')
);

store.dispatch(fetchConf()).then((res) => {
  const { payload } = res;
  initReport(Page.OPTIONS, payload as State['conf']['conf']);
});

