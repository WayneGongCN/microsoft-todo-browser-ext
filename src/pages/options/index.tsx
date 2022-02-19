import React, { Suspense } from 'react';
import { persistor, store } from '../../redux';
import { render } from 'react-dom';
import { App } from './App';
import { PersistGate } from 'redux-persist/es/integration/react';
import { Provider } from 'react-redux';
import '../../styles/style.css';

render(
  <Suspense fallback={<div>Loading ...</div>}>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </Suspense>,
  document.getElementById('root')
);
