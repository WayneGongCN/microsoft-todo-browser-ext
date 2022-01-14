/* eslint-disable @typescript-eslint/ban-ts-comment */
export default (i = process.env.GTM_ID, w = window, d = document, s = 'script', l = 'dataLayer') => {
  // @ts-ignore
  w[l] = w[l] || [];
  // @ts-ignore
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  // @ts-ignore
  j.async = true;
  // @ts-ignore
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + process.env.GTM_ENV;
  // @ts-ignore
  f.parentNode.insertBefore(j, f);
};
