/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import PopupContainer from './containers/PopupContainer';

const backgroundPage = chrome.extension.getBackgroundPage();
const { store } = backgroundPage;

render(
  <Provider store={store}>
    {/* <PopupContainer />
    <AccountContainer /> */}
    <PopupContainer />
  </Provider>,
  document.getElementById('root'),
);
