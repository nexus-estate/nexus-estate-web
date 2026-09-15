/** Returns an internal Customer path or the safe Marketplace default. */
export function safeCustomerNext(rawNext: string | null): string {
  if (
    !rawNext ||
    !rawNext.startsWith('/') ||
    rawNext.startsWith('//') ||
    rawNext.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(rawNext)
  ) {
    return '/';
  }

  try {
    decodeURIComponent(rawNext);
    const url = new URL(rawNext, 'http://nexus-estate.local');
    return url.origin === 'http://nexus-estate.local' ? rawNext : '/';
  } catch {
    return '/';
  }
}
