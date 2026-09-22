import type { WebPlatform } from './config';

const PLATFORM_ENV_KEYS: Record<WebPlatform, string> = {
  marketplace: 'NEXT_PUBLIC_MARKETPLACE_URL',
  provider: 'NEXT_PUBLIC_PROVIDER_URL',
  admin: 'NEXT_PUBLIC_ADMIN_URL',
};

export class PlatformUrlError extends Error {
  readonly key: string;

  constructor(key: string, message: string) {
    super(`${key} ${message}`);
    this.name = 'PlatformUrlError';
    this.key = key;
  }
}

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

type ParsedBase =
  | { ok: true; base: string }
  | { ok: false; reason: 'missing' | 'unparseable' | 'unsafe' };

function normalizeBase(url: URL): string {
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/$/, '');
}

function parsePlatformBaseUrl(platform: WebPlatform): ParsedBase {
  const raw = readPlatformUrl(platform)?.trim();
  if (!raw) return { ok: false, reason: 'missing' };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'unparseable' };
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return { ok: false, reason: 'unsafe' };
  }

  return { ok: true, base: normalizeBase(url) };
}

/**
 * Resolve a configured platform origin, or `null` when it is absent/invalid.
 *
 * Rendering must never depend on cross-platform configuration: callers use
 * this to degrade (hide the link, fall back to a relative path) instead of
 * failing the whole route. Configuration checks use the fail-fast variant.
 */
export function tryGetPlatformBaseUrl(platform: WebPlatform): string | null {
  const parsed = parsePlatformBaseUrl(platform);
  return parsed.ok ? parsed.base : null;
}

/** Fail-fast variant used by configuration checks, not by rendering. */
function getPlatformBaseUrl(platform: WebPlatform): string {
  const key = PLATFORM_ENV_KEYS[platform];
  const parsed = parsePlatformBaseUrl(platform);
  if (parsed.ok) return parsed.base;

  if (parsed.reason === 'missing') {
    throw new PlatformUrlError(
      key,
      `is required to build a cross-platform URL for ${platform}.`,
    );
  }

  throw new PlatformUrlError(
    key,
    parsed.reason === 'unparseable'
      ? 'must be an absolute URL.'
      : 'must be an absolute HTTP(S) URL.',
  );
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

/** Absolute cross-platform URL. Throws when the platform origin is missing. */
export function getPlatformUrl(platform: WebPlatform, path = '/'): string {
  const base = getPlatformBaseUrl(platform);
  const normalizedPath = normalizePath(path);
  return normalizedPath === '/' ? `${base}/` : `${base}${normalizedPath}`;
}

/**
 * Safe cross-platform href for UI rendering.
 *
 * Returns the absolute URL when the platform origin is configured, otherwise
 * the internal path so same-origin deployments (and local development) still
 * link somewhere useful instead of crashing the page.
 */
export function getPlatformHref(platform: WebPlatform, path = '/'): string {
  const normalizedPath = normalizePath(path);
  const base = tryGetPlatformBaseUrl(platform);
  if (!base) return normalizedPath;
  return normalizedPath === '/' ? `${base}/` : `${base}${normalizedPath}`;
}

/** True when the href leaves the current origin (needs an <a>, not a <Link>). */
export function isCrossOriginHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
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

export function getMarketplaceHref(path = '/'): string {
  return getPlatformHref('marketplace', path);
}

export function getProviderHref(path = '/provider'): string {
  return getPlatformHref('provider', path);
}

export function getAdminHref(path = '/admin'): string {
  return getPlatformHref('admin', path);
}
