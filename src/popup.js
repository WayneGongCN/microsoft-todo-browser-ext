/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Container from '@material-ui/core/Container';

chrome.runtime.getBackgroundPage((backgroundPage) => {
  window.Tasklist = backgroundPage.Tasklist;
  window.Task = backgroundPage.Task;
  window.store = backgroundPage.getStore(true);

  import('./containers/PopupContainer')
    .then((res) => res.default)
    .then((PopupContainer) => {
      render(
        <Provider store={window.store}>
          <Container style={{ width: 350, padding: '8px' }}>
            <PopupContainer />
          </Container>
        </Provider>,
        document.getElementById('root'),
      );
    });
});

// import PopupContainer from './containers/PopupContainer';
// import store from './reducers/index';
// import Task from './models/Task';
// import Tasklist from './models/Tasklist';

// window.store = store;
// window.Task = Task;
// window.Tasklist = Tasklist;

// render(
//   <Provider store={store}>
//     <PopupContainer />
//   </Provider>,
//   document.getElementById('root'),
// );
