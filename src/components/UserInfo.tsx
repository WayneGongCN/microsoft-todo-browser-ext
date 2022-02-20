import React from 'react';
import { useSelector } from 'react-redux';
import Avatar from '@mui/material/Avatar';
import { State } from '../redux';
import Grid from '@mui/material/Grid';

const UserInfo: React.FC = () => {
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  if (!account) return null;
  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>
        <Avatar>{account.username.slice(0, 2)}</Avatar>
      </Grid>
      <Grid item>{account.username}</Grid>
    </Grid>
  );
};

export default UserInfo;
