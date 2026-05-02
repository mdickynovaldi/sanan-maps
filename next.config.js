/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "xifepsqtlxkysxekuxyq.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
