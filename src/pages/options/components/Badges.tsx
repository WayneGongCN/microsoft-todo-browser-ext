import Grid from '@material-ui/core/Grid';
import React from 'react';
import { EXT_URL, ISSUE_URL, RATE_URL, REPO_URL } from '../../../constants';

const Badges: React.FC = () => {
  const badgePrefix = `https://img.shields.io`;
  const badgesUrl = [
    {
      name: 'version',
      img: `${badgePrefix}/chrome-web-store/v/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: EXT_URL,
    },
    {
      name: 'users',
      img: `${badgePrefix}/chrome-web-store/users/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: EXT_URL,
    },
    {
      name: 'rating',
      img: `${badgePrefix}/chrome-web-store/stars/ffpljgmbiankjaokoefefmkoghcgoodn?style=social`,
      url: RATE_URL,
    },
    {
      name: 'stars',
      img: `${badgePrefix}/github/stars/waynegongcn/microsoft-todo-browser-ext?style=social`,
      url: REPO_URL,
    },
    {
      name: 'issues',
      img: `${badgePrefix}/github/issues/waynegongcn/microsoft-todo-browser-ext?style=social`,
      url: ISSUE_URL,
    },
  ];

  return (
    <Grid container spacing={1}>
      {badgesUrl.map((x) => (
        <Grid item key={x.name}>
          <a href={x.url} target="_blank" rel="noreferrer">
            <img id={`options-badge-${x.name}`} src={x.img}/>
          </a>
        </Grid>
      ))}
    </Grid>
  );
};

export default Badges;
