/* eslint-disable react/prop-types */
import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

export default function Message(props) {
  const {
    opemMessage, closeMessage, messageType, message,
  } = props;

  return opemMessage && (
    <Snackbar
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={opemMessage}
      onClose={closeMessage}
    >
      {
        messageType && message && (
        <MuiAlert
          variant="filled"
          severity={messageType}
          onClose={closeMessage}
        >
          {message}
        </MuiAlert>
        )
      }

    </Snackbar>
  );
}
