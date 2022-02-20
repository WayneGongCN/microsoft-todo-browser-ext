import Link from '@mui/material/Link';
import React from 'react';
import { openMicrosoftTodo } from '../helpers';

const OpenMSTodo: React.FC = () => {
  return (
    <Link underline="none" component="button" onClick={() => openMicrosoftTodo()} id="com-btn-open-ms">
      Microsoft To Do
    </Link>
  );
};

export default OpenMSTodo;
