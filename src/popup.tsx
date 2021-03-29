// import React from 'react';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import Container from '@material-ui/core/Container';
// import { render } from 'react-dom';

// chrome.runtime.getBackgroundPage((backgroundPage) => {
//   window.msalInstance = backgroundPage.msalInstance;
//   window.Tasklist = backgroundPage.Tasklist;
//   window.Task = backgroundPage.Task;
//   window.store = backgroundPage.getStore(true);

//   import('./containers/PopupContainer')
//     .then((res) => res.default)
//     .then((PopupContainer) => {
//       render(
//         <Provider store={window.store.store}>
//           <PersistGate loading={null} persistor={window.store.persist}>
//             <Container style={{ width: 350, padding: '8px' }}>
//               <PopupContainer />
//             </Container>
//           </PersistGate>
//         </Provider>,
//         document.getElementById('root'),
//       );
//     });
// });
