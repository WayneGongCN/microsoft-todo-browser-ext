import Link from '@material-ui/core/Link';
import React from 'react';
import { openMicrosoftTodo } from '../helpers';

const OpenMSTodo: React.FC = () => {
  return (
    <Link component="button" onClick={() => openMicrosoftTodo()} id="com-btn-open-ms">
      Microsoft To Do
    </Link>
  );
};

export default OpenMSTodo;
