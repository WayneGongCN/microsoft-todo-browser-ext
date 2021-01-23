import React from 'react';
import PropTypes from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Message(props) {
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

export const messagePropTypes = {

  opemMessage: PropTypes.bool.isRequired,
  closeMessage: PropTypes.func.isRequired,
  messageType: PropTypes.string,
  message: PropTypes.string,
};

Message.propTypes = messagePropTypes;
Message.defaultProps = {
  messageType: 'info',
  message: '',
};

export default Message;
