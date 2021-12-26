import { REPORT_ERROR, REPORT_SAMPLE_RATE } from "../constants";

(async () => {
  if (!REPORT_ERROR) return;
  const Sentry = await import("@sentry/browser");
  const Integrations = await import("@sentry/tracing");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: REPORT_SAMPLE_RATE,
  });
})();
