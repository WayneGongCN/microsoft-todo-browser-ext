import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux';
import { LANG_LOADING_TEXT, LANG_LOGIN_TEXT } from '../constants/lang';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { loginAction } from '../redux/auth';



const Login: React.FC = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state: State) => state.auth.loading);
  
  const handleLogin = useCallback(() => {
    dispatch(loginAction())
  }, [dispatch]);

  
  return (
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
  );
};

export default Login;
