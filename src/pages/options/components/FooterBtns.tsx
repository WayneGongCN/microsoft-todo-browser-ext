import { Button, Grid } from '@material-ui/core';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { HOME_URL } from '../../../constants';
import { getI18nConf, openUrl } from '../../../helpers';

interface ButtonConf {
  name: string;
  text: Record<string, string>;
  url: Record<string, string>;
  props: any;
}

/**
 *
 * @returns
 */
const fetchBtnConf = () => axios.request({ baseURL: HOME_URL, url: '/api/v1/optionFooterButtons.json' });

/**
 *
 * @returns
 */
const FooterBtns: React.FC = () => {
  const [btns, setBtns] = useState<ButtonConf[]>([]);
  useEffect(() => {
    fetchBtnConf().then((res) => {
      setBtns(res.data);
    });
  }, []);

  const handleBtnClick = useCallback((btn) => {
    const url = getI18nConf(btn.url);
    url && openUrl({ url });
  }, []);

  return (
    <Grid container justifyContent="flex-end" item xs={12} lg={12} spacing={2}>
      {btns.map((x) => {
        return (
          <Grid item key={x.name}>
            <Button id={`options-btn-${x.name}`} onClick={() => handleBtnClick(x)} {...x.props}>
              {getI18nConf(x.text)}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FooterBtns;
