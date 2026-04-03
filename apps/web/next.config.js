const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1'],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: '/:locale(en)/:path*',
        destination: '/:path*',
        permanent: false,
      },
      {
        source: '/demo',
        destination: '/signup',
        permanent: false,
      },
      {
        source: '/pricing',
        destination: '/signup',
        permanent: false,
      },
      {
        source: '/study',
        destination: '/pyqs',
        permanent: false,
      },
      {
        source: '/tests',
        destination: '/pyqs',
        permanent: false,
      },
      {
        source: '/features',
        destination: '/',
        permanent: false,
      },
      {
        source: '/faq',
        destination: '/',
        permanent: false,
      },
      {
        source: '/logout',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig);
