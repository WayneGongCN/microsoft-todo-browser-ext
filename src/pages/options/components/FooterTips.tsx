import React, { useEffect, useState } from 'react';
import Link from '@mui/material/Link';
import { getOptionPageFooterTipsRequest, OptionPageFooterTipsConf } from '../../../api/getOptionPageFooterTips';
import { getI18nConf } from '../../../helpers';



const FooterTips: React.FC = () => {
  const [tipsConf, setTipsConf] = useState<OptionPageFooterTipsConf>()
  useEffect(() => {
    getOptionPageFooterTipsRequest().then(setTipsConf)
  }, [])


  if (!tipsConf) return null
  return (
    <Link variant="inherit" color="textSecondary" href={getI18nConf(tipsConf.link)} target="_blank" rel="noreferrer">
      {getI18nConf(tipsConf.content)}
    </Link>
  );
};

export default FooterTips;
