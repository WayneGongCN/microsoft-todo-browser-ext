import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import { ButtonConf, getButtonsRequest } from '../../../api/getButtons';
import { getI18nConf, openUrl } from '../../../helpers';

/**
 *
 * @returns
 */
const FooterBtns: React.FC = () => {
  const [btns, setBtns] = useState<ButtonConf[]>([]);
  useEffect(() => {
    getButtonsRequest().then(setBtns);
  }, []);

  const handleBtnClick = useCallback((btn) => {
    const url = getI18nConf(btn.url);
    url && openUrl({ url });
  }, []);

  return (
    <>
      {btns.map((x) => {
        return (
          <Grid item key={x.name}>
            <Button id={`options-btn-${x.name}`} onClick={() => handleBtnClick(x)} {...x.props}>
              {getI18nConf(x.text)}
            </Button>
          </Grid>
        );
      })}
    </>
  );
};

export default FooterBtns;
