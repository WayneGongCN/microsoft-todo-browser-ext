/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers/popup';
import PopupContainer from './containers/PopupContainer';

const store = createStore(reducer);

render(
  <Provider store={store}>
    <PopupContainer />
  </Provider>,
  document.getElementById('root'),
);
