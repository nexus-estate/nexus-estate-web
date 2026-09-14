import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment (reduces image size)
  output: 'standalone',

  // Keep next/jest on the compiler API path supported by the pinned TypeScript.
  experimental: { useTypeScriptCli: false },

  // Disable Next.js telemetry
  // telemetry: { enabled: false }, // Not a config option, set via env
};

export default nextConfig;
