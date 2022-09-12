import { persistor, store } from '../../redux';
import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { PersistGate } from 'redux-persist/es/integration/react';
import { Provider } from 'react-redux';
import Loading from '../../components/Loading';
import { fetchConfAction } from '../../redux/conf';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

render(
  <ThemeProvider theme={theme}>
    <Suspense fallback={<Loading />}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </Suspense>
  </ThemeProvider>,

  document.getElementById('root')
);


(() => {
  store.dispatch(fetchConfAction())
})();
