import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Container from '@material-ui/core/Container';

chrome.runtime.getBackgroundPage((backgroundPage) => {
  window.msalInstance = backgroundPage.msalInstance;
  window.Tasklist = backgroundPage.Tasklist;
  window.Task = backgroundPage.Task;
  window.store = backgroundPage.getStore(true);

  import('./containers/PopupContainer')
    .then((res) => res.default)
    .then((PopupContainer) => {
      render(
        // eslint-disable-next-line react/jsx-filename-extension
        <Provider store={window.store}>
          <Container style={{ width: 350, padding: '8px' }}>
            <PopupContainer />
          </Container>
        </Provider>,
        document.getElementById('root'),
      );
    });
});
