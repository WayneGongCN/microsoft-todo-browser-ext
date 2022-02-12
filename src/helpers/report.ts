import { REPORT, REPORT_SAMPLE_RATE, VERSION } from '../constants';
import { Page } from '../constants/enums';
import { logger } from './logger';

let Sentry: any = null;
const reportQueue: any[] = [];

export const report = (e: string | Error) => {
  if (!REPORT) return;
  if (!Sentry) return reportQueue.push(e);

  if (typeof e === 'string') {
    Sentry.captureMessage(e);
  } else if (e) {
    Sentry.captureException(e);
  }
};

const initSentry = async (page: Page) => {
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

  //
  reportQueue.forEach((x) => report(x));
  reportQueue.length = 0;
};

/* eslint-disable @typescript-eslint/ban-ts-comment */
const initGTM = (i: string, env = '', w = window, d = document, s = 'script', l = 'dataLayer') => {
  // @ts-ignore
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + env;
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

export const initReport = (page: Page) => {
  if (!REPORT) return;

  initSentry(page);
  if (page !== Page.BACKGROUND) initGTM(process.env.GTM_ID, process.env.GTM_ENV);
};
