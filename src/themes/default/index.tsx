import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { State } from '../../redux';
import TaskForm from './components/TaskForm';
import Login from '../../components/Login';
import OpenMSTodo from '../../components/OpenMSToDo';
import { Grid } from '@material-ui/core';
import { now, timing } from '../../helpers/report';


const Default: React.FC<void> = () => {
  useEffect(() => {
    timing('popup rendered', now());
  }, []);

  const authed = useSelector((state: State) => state.auth.authenticationResult);

  return (
    <Grid container spacing={1}>
      <Grid container item justifyContent="flex-end" alignItems="center">
        <OpenMSTodo />
      </Grid>

      {authed ? (
        <TaskForm />
      ) : (
        <Grid container item>
          <Login />
        </Grid>
      )}
    </Grid>
  );
};

export default Default;
