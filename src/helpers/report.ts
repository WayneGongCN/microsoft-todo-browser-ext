import { IS_DEV, REPORT_SAMPLE_RATE } from '../constants';
import { version } from '../../package.json';
import { Page } from '../constants/enums';

export default async (page: Page) => {
  if (IS_DEV) return;

  let Sentry = null;
  if (page === Page.BACKGROUND) {
    Sentry = await import('@sentry/browser');
  } else if (page === Page.POPUP || page === Page.OPTIONS) {
    Sentry = await import('@sentry/react');
  }
  const Integrations = await import('@sentry/tracing');

  Sentry.init({
    environment: process.env.NODE_ENV,
    release: version,
    dsn: process.env.SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: REPORT_SAMPLE_RATE,
  });
};
