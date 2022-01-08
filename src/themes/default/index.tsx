import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { State } from '../../redux';
import TaskForm from './components/TaskForm';
import { useEffect } from 'react';
import { logger } from '../../helpers/logger';
import Login from './components/Login';
import OpenMSTodo from './components/OpenMSToDo';
import { backgroundContext } from '..';

const Default: React.FC<void> = () => {
  useEffect(() => {
    logger.timeEnd('theme');
  }, []);

  const authed = useSelector((state: State) => state.auth.authenticationResult);
  return (
    <Provider store={backgroundContext.store}>
      <OpenMSTodo />
      {authed ? <TaskForm /> : <Login />}
    </Provider>
  );
};

export default Default;
