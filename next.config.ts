import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/** Applied to every response; keep this list in sync with the CSP in deploy docs. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment (reduces image size)
  output: 'standalone',

  // Do not advertise the framework version.
  poweredByHeader: false,

  // Keep next/jest on the compiler API path supported by the pinned TypeScript.
  experimental: { useTypeScriptCli: false },

  images: {
    // Serve modern formats first; the optimizer falls back per accepted header.
    formats: ['image/avif', 'image/webp'],
    // Stock catalogue imagery stays local, so no remote allowlist is needed yet.
    remotePatterns: [],
    minimumCacheTTL: 60 * 60 * 24,
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Hashed build assets are immutable.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
