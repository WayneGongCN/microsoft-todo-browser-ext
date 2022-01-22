import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux';
import { LANG_LOADING_TEXT, LANG_LOGIN_TEXT } from '../constants/lang';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { backgroundContext } from '../helpers/background';

const Login: React.FC = () => {
  const { authSlice } = backgroundContext;
  const dispatch = useDispatch();
  const loading = useSelector((state: State) => state.auth.loading);

  const handleLogin = useCallback(() => {
    dispatch(authSlice.acquireToken(false));
  }, [dispatch]);

  return (
    <Container>
      <Button
        fullWidth
        id="com-btn-login"
        color="primary"
        variant="contained"
        disabled={loading}
        endIcon={loading ? <CircularProgress size={20} /> : null}
        onClick={handleLogin}
      >
        {loading ? LANG_LOADING_TEXT + '...' : LANG_LOGIN_TEXT}
      </Button>
    </Container>
  );
};

export default Login;
