// Konfigurasi Sentry untuk runtime Node.js (server). No-op bila DSN kosong.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // Sesuaikan di produksi; 1.0 = rekam semua transaksi (turunkan bila trafik tinggi).
  tracesSampleRate: 1.0,
  debug: false,
});
