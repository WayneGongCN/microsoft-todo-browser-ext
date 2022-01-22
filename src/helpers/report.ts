import { REPORT, REPORT_SAMPLE_RATE, VERSION } from '../constants';
import { Page } from '../constants/enums';
import { logger } from './logger';

export const initSentry = async (page: Page) => {
  if (!REPORT) return;

  let Sentry = null;
  if (page === Page.BACKGROUND) {
    Sentry = await import('@sentry/browser');
  } else if (page === Page.POPUP || page === Page.OPTIONS) {
    Sentry = await import('@sentry/react');
  }
  const Integrations = await import('@sentry/tracing');

  Sentry.init({
    environment: process.env.NODE_ENV,
    release: VERSION,
    dsn: process.env.SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: REPORT_SAMPLE_RATE,
  });
};

/* eslint-disable @typescript-eslint/ban-ts-comment */
const dataLayer = 'dataLayer';
export const initGTM = (i = process.env.GTM_ID, w = window, d = document, s = 'script', l = dataLayer) => {
  if (!REPORT) return;

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

export const now = () => performance.now();

export const timing = function (name: string, value: number, category = 'Default', label = '') {
  if (!REPORT) return;

  if (window.ga) {
    logger.log('timing: ', name, value);
    window.ga('gtm4.send', 'timing', category, name, Math.round(value), label);
  } else {
    setTimeout(() => {
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      timing(...arguments);
    }, 1000);
  }
};
