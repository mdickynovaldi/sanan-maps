// Konfigurasi Sentry untuk browser. No-op bila DSN kosong.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 1.0,
  // Session Replay dinonaktifkan secara default; aktifkan bila diperlukan.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});

// Melacak navigasi App Router untuk tracing sisi klien.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
