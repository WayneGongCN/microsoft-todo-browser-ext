import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

function Login(props) {
  const { login, loading } = props;
  return (
    <Button
      size="small"
      variant="contained"
      color="primary"
      disabled={loading}
      onClick={login}
      endIcon={loading && <CircularProgress size={20} />}
    >
      {loading ? 'Please waiting ...' : 'LOGIN'}
    </Button>
  );
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Login;
