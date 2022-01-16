import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { State } from '../../redux';
import TaskForm from './components/TaskForm';
import Login from './components/Login';
import OpenMSTodo from './components/OpenMSToDo';
import { backgroundContext } from '../../helpers/background';
import { timing } from '../../helpers/report';

const Default: React.FC<void> = () => {
  useEffect(() => {
    timing('popup rendered', performance.now())
  }, [])

  const authed = useSelector((state: State) => state.auth.authenticationResult);
  return (
    <Provider store={backgroundContext.store}>
      <OpenMSTodo />
      {authed ? <TaskForm /> : <Login />}
    </Provider>
  );
};

export default Default;