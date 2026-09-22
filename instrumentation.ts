import { collectEnvIssues, formatEnvIssues } from '@/lib/config/env';
import { getWebPlatform } from '@/lib/platform/config';

/**
 * Validate runtime configuration when the Node server starts.
 *
 * Two different failure modes on purpose:
 *
 * - Invalid values (an unparseable URL, an unknown platform) throw. They cannot
 *   be worked around at runtime, and a wrong `WEB_PLATFORM` would silently serve
 *   the wrong product.
 * - Unset values are reported and then ignored. A missing `NEXT_PUBLIC_API_URL`
 *   must cost one feature, not the whole server: killing the process turned a
 *   degraded deployment into a total outage (and stopped `npm run start` from
 *   booting at all in environments that do not need the API, such as the e2e
 *   run).
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Platform validation stays fail-fast: an invalid WEB_PLATFORM must never be
  // served as the wrong product.
  getWebPlatform();

  const issues = collectEnvIssues();
  const invalid = issues.filter((issue) => issue.severity === 'error');
  const unset = issues.filter((issue) => issue.severity === 'warn');

  if (invalid.length) {
    throw new Error(
      `Invalid environment configuration:\n${formatEnvIssues(invalid)}`,
    );
  }

  if (unset.length) {
    console.warn(
      `[env] ${unset.length} variable(s) are not set; related features degrade gracefully:\n${formatEnvIssues(unset)}`,
    );
  }
}
