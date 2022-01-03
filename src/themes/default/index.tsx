import React from 'react';
import { useSelector } from 'react-redux';
import { State } from '../../redux';
import TaskForm from './components/TaskForm';
import { useEffect } from 'react';
import { logger } from '../../helpers/logger';
import Login from './components/Login';
import Container from '@material-ui/core/Container';
import OpenMSTodo from './components/OpenMSToDo';

const Default: React.FC<void> = () => {
  useEffect(() => {
    logger.timeEnd('theme');
  }, []);

  const authed = useSelector((state: State) => state.auth.authenticationResult);
  return (
    <Container style={{ width: 350, padding: 10 }}>
      <OpenMSTodo />
      {authed ? <TaskForm /> : <Login />}
    </Container>
  );
};

export default Default;
