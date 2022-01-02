import { Button } from '@material-ui/core';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../../redux';
import { backgroundContext } from '../../../popup/';

const Login: React.FC<any> = () => {
  const dispatch = useDispatch();
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);
  const loading = useSelector((state: State) => state.auth.loading);

  const handleLogin = useCallback(() => {
    dispatch(backgroundContext.authSlice.authentication());
  }, [dispatch]);

  useEffect(() => {
    if (!account) handleLogin();
  }, []);

  if (account) return <h2>Hello {account.name}</h2>;
  else if (loading) return <h2>Loading ...</h2>;
  else return <Button onClick={handleLogin}>Login</Button>;
};

export default Login;
