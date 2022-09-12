import React, { Suspense } from 'react';
import { persistor, store } from '../../redux';
import { render } from 'react-dom';
import { EThemes } from '../../constants/enums';
import Container from '@mui/material/Container';
import { Provider } from 'react-redux';
import { loadTheme } from '../../themes';
import { PersistGate } from 'redux-persist/es/integration/react';


const themeName = EThemes.DEFAULT;
const Theme = loadTheme(themeName);


render(
  <Container disableGutters style={{ width: 350, padding: 10 }}>
    <Suspense fallback={<div>Loading ...</div>}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Theme />
        </PersistGate>
      </Provider>
    </Suspense>
  </Container>,
  document.getElementById('root')
);
