export const WEB_PLATFORMS = ['marketplace', 'provider', 'admin'] as const;

export type WebPlatform = (typeof WEB_PLATFORMS)[number];

const LEGACY_PLATFORM_FALLBACK: WebPlatform = 'marketplace';

function isWebPlatform(value: string): value is WebPlatform {
  return (WEB_PLATFORMS as readonly string[]).includes(value);
}

/**
 * Resolve the runtime platform from an explicit value.
 *
 * Development and test keep the pre-platform behavior when the variable is
 * absent so frontend rollout can precede infrastructure rollout. Invalid
 * values always fail fast; production never falls back silently.
 */
export function parseWebPlatform(
  value: string | undefined,
  options: { nodeEnv?: string } = {},
): WebPlatform {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV;
  const normalized = value?.trim().toLowerCase();

  if (normalized && isWebPlatform(normalized)) return normalized;

  if (normalized) {
    throw new Error(
      `Invalid WEB_PLATFORM "${value}". Expected one of: ${WEB_PLATFORMS.join(', ')}.`,
    );
  }

  if (nodeEnv !== 'production') return LEGACY_PLATFORM_FALLBACK;

  throw new Error(
    `WEB_PLATFORM is required in production. Expected one of: ${WEB_PLATFORMS.join(', ')}.`,
  );
}

/** Resolve the platform for the current server request/runtime. */
export function getWebPlatform(): WebPlatform {
  return parseWebPlatform(process.env.WEB_PLATFORM);
}

export function getPlatformTitle(platform: WebPlatform) {
  switch (platform) {
    case 'provider':
      return 'Nexus Estate Provider';
    case 'admin':
      return 'Nexus Estate Administration';
    case 'marketplace':
      return 'Nexus Estate';
  }
}
