import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import { OptionPageFooterButton, getButtonsRequest } from '../../../api/getButtons';
import { getI18nConf, openUrl } from '../../../helpers';

/**
 *
 * @returns
 */
const FooterBtns: React.FC = () => {
  const [btns, setBtns] = useState<OptionPageFooterButton[]>([]);
  useEffect(() => {
    getButtonsRequest().then(setBtns);
  }, []);


  const handleBtnClick = useCallback((btn: OptionPageFooterButton) => {
    const url = getI18nConf(btn.link);
    url && openUrl({ url });
  }, []);


  return (
    <>
      {btns.map((x) => {
        const { name, content, props } = x
        return (
          <Grid item key={name}>
            <Button onClick={() => handleBtnClick(x)} {...props}>
              {getI18nConf(content)}
            </Button>
          </Grid>
        );
      })}
    </>
  );
};

export default FooterBtns;
