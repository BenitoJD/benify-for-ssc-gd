const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
        source: '/about',
        destination: '/',
        permanent: false,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: false,
      },
      {
        source: '/privacy',
        destination: '/',
        permanent: false,
      },
      {
        source: '/terms',
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
