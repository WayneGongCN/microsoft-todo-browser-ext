/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

chrome.runtime.getBackgroundPage((backgroundPage) => {
  window.Tasklist = backgroundPage.Tasklist;
  window.Task = backgroundPage.Task;
  window.store = backgroundPage.store;

  import('./containers/PopupContainer')
    .then((res) => res.default)
    .then((PopupContainer) => {
      render(
        <Provider store={window.store}>
          <PopupContainer />
        </Provider>,
        document.getElementById('root'),
      );
    });
});
