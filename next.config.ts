import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const devOrigins = [
  '*.trycloudflare.com',
  ...(process.env.DEV_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean),
  ...[
    process.env.NEXT_PUBLIC_MARKETPLACE_URL,
    process.env.NEXT_PUBLIC_PROVIDER_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
  ].flatMap((value) => (value ? [new URL(value).hostname] : [])),
];

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment (reduces image size)
  output: 'standalone',

  allowedDevOrigins: devOrigins,

  // Use the FE tunnel for browser API calls during local development.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const target = (
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:50001/api/v1'
    ).replace(/\/$/, '');
    if (!/^https?:\/\//.test(target)) return [];
    return [{ source: '/api/v1/:path*', destination: `${target}/:path*` }];
  },

  // Keep next/jest on the compiler API path supported by the pinned TypeScript.
  experimental: { useTypeScriptCli: false },

  // Disable Next.js telemetry
  // telemetry: { enabled: false }, // Not a config option, set via env
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
