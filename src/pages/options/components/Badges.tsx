import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { BadgeConf, getBadgesRequest } from '../../../api/getBadges';
import { getI18nConf } from '../../../helpers';



/**
 *
 * @returns
 */
const Badges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeConf[]>([]);
  useEffect(() => {
    getBadgesRequest().then(setBadges);
  }, []);


  return (
    <>
      {badges.map((x) => {
        return (
          <Grid item key={x.name}>
            <a href={getI18nConf(x.url)} target="_blank" rel="noreferrer">
              <img alt={x.name} id={`options-badge-${x.name}`} src={getI18nConf(x.img)} />
            </a>
          </Grid>
        );
      })}
    </>
  );
};

export default Badges;
