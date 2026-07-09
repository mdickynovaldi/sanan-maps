/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase production
      {
        protocol: "https",
        hostname: "nxvsmuhcqepcutiuhbfw.supabase.co",
      },
      // Supabase lokal (npx supabase start — lihat CLAUDE.md)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54331",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54331",
      },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require("@sentry/nextjs");

// Sentry membungkus config untuk instrumentasi & (opsional) upload source map.
// Upload source map hanya jalan bila SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// di-set (mis. di CI); tanpa itu build tetap sukses, hanya tanpa source map.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  // Route tunneling untuk menghindari ad-blocker (opsional).
  tunnelRoute: "/monitoring",
});
