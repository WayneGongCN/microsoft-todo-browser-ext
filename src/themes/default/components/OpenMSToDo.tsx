import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import React from 'react';
import { openMicrosoftTodo } from '../../../helpers';

const OpenMSTodo: React.FC<any> = () => {
  return (
    <Grid container direction="row-reverse">
      <Link component="button" onClick={() => openMicrosoftTodo()}>
        Microsoft To Do
      </Link>
    </Grid>
  );
};

export default OpenMSTodo;
