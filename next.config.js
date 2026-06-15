/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
