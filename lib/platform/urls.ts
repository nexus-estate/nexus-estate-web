import type { WebPlatform } from './config';

const PLATFORM_ENV_KEYS: Record<WebPlatform, string> = {
  marketplace: 'NEXT_PUBLIC_MARKETPLACE_URL',
  provider: 'NEXT_PUBLIC_PROVIDER_URL',
  admin: 'NEXT_PUBLIC_ADMIN_URL',
};

function readPlatformUrl(platform: WebPlatform): string | undefined {
  // Keep these references static so Next.js embeds them in Client Components.
  switch (platform) {
    case 'marketplace':
      return process.env.NEXT_PUBLIC_MARKETPLACE_URL;
    case 'provider':
      return process.env.NEXT_PUBLIC_PROVIDER_URL;
    case 'admin':
      return process.env.NEXT_PUBLIC_ADMIN_URL;
  }
}

function getPlatformBaseUrl(platform: WebPlatform): string {
  const key = PLATFORM_ENV_KEYS[platform];
  const raw = readPlatformUrl(platform)?.trim();

  if (!raw) {
    throw new Error(
      `${key} is required to build a cross-platform URL for ${platform}.`,
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${key} must be an absolute URL.`);
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${key} must be an absolute HTTP(S) URL.`);
  }

  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/$/, '');
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\')
  ) {
    throw new Error('Platform URL paths must be internal absolute paths.');
  }
  return trimmed || '/';
}

export function getPlatformUrl(platform: WebPlatform, path = '/'): string {
  const base = getPlatformBaseUrl(platform);
  const normalizedPath = normalizePath(path);
  return normalizedPath === '/' ? `${base}/` : `${base}${normalizedPath}`;
}

export function getMarketplaceUrl(path = '/'): string {
  return getPlatformUrl('marketplace', path);
}

export function getProviderUrl(path = '/provider'): string {
  return getPlatformUrl('provider', path);
}

export function getAdminUrl(path = '/admin'): string {
  return getPlatformUrl('admin', path);
}
