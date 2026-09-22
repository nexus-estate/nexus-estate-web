import { WEB_PLATFORMS, parseWebPlatform } from '@/lib/platform/config';
import { tryGetPlatformBaseUrl } from '@/lib/platform/urls';

/**
 * Environment validation without extra dependencies.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so they must be referenced
 * statically — never destructure `process.env` or index it with a variable.
 */

export type EnvIssue = {
  key: string;
  message: string;
  /**
   * `error` means the value is present but wrong — no amount of graceful
   * degradation can fix it. `warn` means it is unset (or only degrades a
   * feature): the process must still boot and serve pages, because a missing
   * variable should cost one feature, never the whole server.
   */
  severity: 'error' | 'warn';
};

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function checkUrl(key: string, value: string | undefined, issue: EnvIssue[]) {
  const trimmed = value?.trim();
  if (!trimmed) {
    issue.push({
      key,
      severity: 'warn',
      message: 'not set — cross-platform links fall back to internal paths.',
    });
    return;
  }
  if (!isAbsoluteHttpUrl(trimmed)) {
    issue.push({
      key,
      severity: 'error',
      message: `"${trimmed}" is not an absolute HTTP(S) URL.`,
    });
  }
}

export function getPublicEnv() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() ?? '',
    marketplaceUrl: process.env.NEXT_PUBLIC_MARKETPLACE_URL?.trim() ?? '',
    providerUrl: process.env.NEXT_PUBLIC_PROVIDER_URL?.trim() ?? '',
    adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ?? '',
  };
}

/** Collect every configuration problem in one pass. */
export function collectEnvIssues(
  env: NodeJS.ProcessEnv = process.env,
): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (!env.WEB_PLATFORM?.trim()) {
    issues.push({
      key: 'WEB_PLATFORM',
      severity: env.NODE_ENV === 'production' ? 'error' : 'warn',
      message: `not set — expected one of: ${WEB_PLATFORMS.join(', ')}.`,
    });
  } else {
    try {
      parseWebPlatform(env.WEB_PLATFORM, { nodeEnv: env.NODE_ENV });
    } catch (error) {
      issues.push({
        key: 'WEB_PLATFORM',
        severity: 'error',
        message: error instanceof Error ? error.message : 'invalid value.',
      });
    }
  }

  const apiUrl = env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    issues.push({
      key: 'NEXT_PUBLIC_API_URL',
      severity: 'warn',
      message:
        'not set — the web app renders without catalogue data until it is configured.',
    });
  } else if (!isAbsoluteHttpUrl(apiUrl)) {
    issues.push({
      key: 'NEXT_PUBLIC_API_URL',
      severity: 'error',
      message: `"${apiUrl}" is not an absolute HTTP(S) URL.`,
    });
  }

  checkUrl(
    'NEXT_PUBLIC_MARKETPLACE_URL',
    env.NEXT_PUBLIC_MARKETPLACE_URL,
    issues,
  );
  checkUrl('NEXT_PUBLIC_PROVIDER_URL', env.NEXT_PUBLIC_PROVIDER_URL, issues);
  checkUrl('NEXT_PUBLIC_ADMIN_URL', env.NEXT_PUBLIC_ADMIN_URL, issues);

  return issues;
}

export function formatEnvIssues(issues: EnvIssue[]): string {
  return issues
    .map((issue) => `  [${issue.severity}] ${issue.key}: ${issue.message}`)
    .join('\n');
}

/**
 * Throws when the environment cannot run correctly.
 *
 * Used by configuration checks and tests: in production every issue is
 * blocking, in development only invalid values are. The server bootstrap uses
 * `collectEnvIssues` instead, so it does not refuse to start over an unset
 * optional variable.
 */
export function assertRuntimeEnv(
  env: NodeJS.ProcessEnv = process.env,
): EnvIssue[] {
  const issues = collectEnvIssues(env);
  const blocking = issues.filter(
    (issue) => issue.severity === 'error' || env.NODE_ENV === 'production',
  );

  if (blocking.length) {
    throw new Error(
      `Invalid environment configuration:\n${formatEnvIssues(blocking)}`,
    );
  }

  return issues;
}

/** True when a cross-platform origin is configured for the given key. */
export function hasPlatformUrl(platform: 'marketplace' | 'provider' | 'admin') {
  return tryGetPlatformBaseUrl(platform) !== null;
}
