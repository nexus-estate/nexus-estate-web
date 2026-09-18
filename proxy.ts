import { NextRequest, NextResponse } from 'next/server';
import { getWebPlatform } from '@/lib/platform/config';
import { getPlatformRequestDecision } from '@/lib/platform/routes';

export function proxy(request: NextRequest) {
  const platform = getWebPlatform();
  const decision = getPlatformRequestDecision(
    platform,
    request.nextUrl.pathname,
  );

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.destination, request.url));
  }

  if (decision.type === 'not-found') {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
