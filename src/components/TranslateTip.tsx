import React from 'react';
import { LANG_TRANSLATE_TIP } from '../constants/lang';
import Link from '@material-ui/core/Link';
import { ISSUE_URL } from '../constants';

const TranslateTip: React.FC = () => {
  return (
    <Link id="com-link-translate-tip" variant="inherit" color="textSecondary" href={ISSUE_URL} target="_blank" rel="noreferrer">
      {LANG_TRANSLATE_TIP}
    </Link>
  );
};

export default TranslateTip;
