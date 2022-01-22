import React, { useCallback } from 'react';
import { LANG_LOADING_TEXT, LANG_LOGOUT_TEXT } from '../constants/lang';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { backgroundContext } from '../helpers/background';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux';

const Logout: React.FC = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state: State) => state.auth.loading);

  const handleLogout = useCallback(() => {
    const { authSlice } = backgroundContext;
    dispatch(authSlice.logout());
  }, []);

  return (
    <Button id="com-btn-logout" fullWidth disabled={loading} endIcon={loading ? <CircularProgress size={20} /> : null} onClick={handleLogout}>
      {loading ? LANG_LOADING_TEXT + '...' : LANG_LOGOUT_TEXT}
    </Button>
  );
};

export default Logout;
