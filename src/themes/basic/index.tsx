import React from 'react';
import Hello from './components/Hello';
import Login from './components/Login';
import Tasklists from './components/Tasklists';

const Basic: React.FC<any> = () => {
  return (
    <>
      <Hello />
      <Login />
      <Tasklists />
    </>
  );
};

export default Basic;
