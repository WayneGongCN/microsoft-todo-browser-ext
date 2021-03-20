import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Container from '@material-ui/core/Container';
import { PersistGate } from 'redux-persist/integration/react';

chrome.runtime.getBackgroundPage((backgroundPage) => {
  window.msalInstance = backgroundPage.msalInstance;
  window.store = backgroundPage.getStore(true);

  render(
    <Provider store={window.store.store}>
      <PersistGate loading={null} persistor={window.store.persist}>
        <Container>
          Hello world.
        </Container>
      </PersistGate>
    </Provider>,
    document.getElementById('root'),
  );
});
