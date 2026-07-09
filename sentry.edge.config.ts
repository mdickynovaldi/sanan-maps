// Konfigurasi Sentry untuk runtime Edge (middleware, edge routes). No-op bila DSN kosong.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 1.0,
  debug: false,
});
