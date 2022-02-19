/* eslint-disable @typescript-eslint/no-explicit-any */
import { State, store } from '../redux';
import { Page } from '../constants/enums';
import AppError from './error';
import { logger } from './logger';
import { NODE_ENV, VERSION } from '../constants';

let Sentry: any = null;
const reportQueue: any[] = [];

export const report = (e: AppError) => {
  if (!Sentry) return reportQueue.push(e);
  Sentry.captureException(e);
};

const initSentry = async (page: Page, sentryDsn: string, reportSampleRate: number) => {
  if (page === Page.BACKGROUND) {
    Sentry = await import('@sentry/browser');
  } else if (page === Page.POPUP || page === Page.OPTIONS) {
    Sentry = await import('@sentry/react');
  }
  const Integrations = await import('@sentry/tracing');

  Sentry.init({
    environment: NODE_ENV,
    release: VERSION,
    dsn: sentryDsn,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: reportSampleRate,
  });

  //
  reportQueue.forEach((x) => report(x));
  reportQueue.length = 0;
};

/* eslint-disable @typescript-eslint/ban-ts-comment */
const initGTM = (i: string, env = '', w = window, d = document, s = 'script', l = 'dataLayer') => {
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
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + env;
  f.parentNode.insertBefore(j, f);
};

export const now = () => performance.now();

export const timing = function (name: string, value: number, category = 'Default', label = '') {
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

export const initReport = (page: Page, conf: State['conf']['conf']) => {
  const { sentryDsn, reportSampleRate, gtmID, gtmEvn } = conf

  initSentry(page, sentryDsn, reportSampleRate);
  if (page !== Page.BACKGROUND) initGTM(gtmID, gtmEvn);
};
