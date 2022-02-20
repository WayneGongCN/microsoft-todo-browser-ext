import Grid from '@mui/material/Grid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { HOME_URL } from '../../../constants';
import { getI18nConf } from '../../../helpers';

interface BadgeConf {
  name: string;
  img: Record<string, string>;
  url: Record<string, string>;
}

/**
 *
 * @returns
 */
export const fetchBadges = () => axios.request<BadgeConf[]>({ baseURL: HOME_URL, url: '/api/v1/badges.json' });

/**
 *
 * @returns
 */
const Badges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeConf[]>([]);
  useEffect(() => {
    fetchBadges().then((res) => {
      setBadges(res.data);
    });
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
