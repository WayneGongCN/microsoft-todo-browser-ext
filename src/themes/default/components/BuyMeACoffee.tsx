import React from 'react';
import { IBuyMeACoffeeOptions } from '../../../../types';
import { BUY_ME_COFFEE_DEFAULT_OPTIONS } from '../../../constants';

const BuyMeACoffee: React.FC<IBuyMeACoffeeOptions> = (props) => {
  const mergeOptions = {
    ...BUY_ME_COFFEE_DEFAULT_OPTIONS,
    ...props,
  };

  const url = `https://www.buymeacoffee.com/${mergeOptions.slug}`;
  const imgUrl = Object.keys(mergeOptions)
    .reduce((url, key) => {
      url.searchParams.set(key, (mergeOptions as unknown as Record<string, string>)[key]);
      return url;
    }, new URL(`https://img.buymeacoffee.com/button-api/`))
    .toString();

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={imgUrl} style={{height: '3.2em'}}/>
    </a>
  );
};

export default BuyMeACoffee;
