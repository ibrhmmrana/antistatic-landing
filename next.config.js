/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next 14 uses this key to keep server-only packages external (not webpack-bundled).
    // This avoids build-time resolution of Playwright optional deps/assets (electron, chromium-bidi, recorder fonts/html).
    serverComponentsExternalPackages: ["playwright-core", "@sparticuz/chromium"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    // Allow images from local API routes
    domains: ['localhost'],
    unoptimized: false,
  },
};

module.exports = nextConfig;

