import { NextResponse } from 'next/server';

import { getProviderUrl } from '@/lib/platform/urls';

/**
 * Compatibility shim: Property creation moved to the Provider platform at
 * /provider/properties/new. A Route Handler is used so the redirect is a real
 * HTTP 307 with an absolute Location header — the route also renders on the
 * Marketplace host, where `/provider/*` does not exist and a relative redirect
 * would 404. Removed in the legacy-cleanup stage.
 */
export function GET(): NextResponse {
  return NextResponse.redirect(getProviderUrl('/provider/properties/new'), 307);
}
