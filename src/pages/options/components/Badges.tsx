import Grid from '@material-ui/core/Grid';
import React from 'react';
import { State } from '../../../redux';

const Badges: React.FC = () => {
  // const loading = useSelector((state: State) => state.auth.loading);

  const badgesUrl = [
    'https://img.shields.io/chrome-web-store/v/ffpljgmbiankjaokoefefmkoghcgoodn?style=social',
    'https://img.shields.io/chrome-web-store/users/ffpljgmbiankjaokoefefmkoghcgoodn?style=social',
    'https://img.shields.io/chrome-web-store/stars/ffpljgmbiankjaokoefefmkoghcgoodn?style=social',
    'https://img.shields.io/github/stars/waynegongcn/microsoft-todo-browser-ext?style=social',
    'https://img.shields.io/github/issues/waynegongcn/microsoft-todo-browser-ext?style=social',
  ];

  return (
    <Grid container spacing={1}>
      {badgesUrl.map((x) => (
        <Grid item key={x}>
          <img src={x} />
        </Grid>
      ))}
    </Grid>
  );
};

export default Badges;
