import { getWebPlatform } from '@/lib/platform/config';

/** Validate runtime configuration when the Node server starts. */
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') getWebPlatform();
}
