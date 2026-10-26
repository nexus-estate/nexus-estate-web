/** Keep local browser requests on the FE origin when using a dev tunnel. */
export function getBrowserApiBaseUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50001/api/v1'
  ).replace(/\/$/, '');

  if (
    process.env.NODE_ENV === 'development' &&
    /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(
      configured,
    )
  ) {
    return '/api/v1';
  }

  return configured;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') return getBrowserApiBaseUrl();
  return (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50001/api/v1'
  ).replace(/\/$/, '');
}
