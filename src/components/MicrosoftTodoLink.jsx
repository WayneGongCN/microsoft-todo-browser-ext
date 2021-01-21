import React from 'react';
import Link from '@material-ui/core/Link';
import { Grid } from '@material-ui/core';

export default function MicrosoftTodoLink() {
  return (
    <Grid container direction="row-reverse">
      <Grid item>
        <Link
          component="button"
          style={{ cursor: 'pointer' }}
          onClick={() => chrome.tabs.create({ active: true, url: 'https://to-do.live.com/tasks/inbox' })}
        >
          To Microsoft To-Do
        </Link>
      </Grid>
    </Grid>
  );
}
