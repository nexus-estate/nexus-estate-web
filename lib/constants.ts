export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1';

export const CUSTOMER_ACCESS_TOKEN_KEY = 'nexus.customer.access_token';
export const CUSTOMER_REFRESH_TOKEN_KEY = 'nexus.customer.refresh_token';
export const ADMINISTRATION_ACCESS_TOKEN_KEY =
  'nexus.administration.access_token';
export const ADMINISTRATION_REFRESH_TOKEN_KEY =
  'nexus.administration.refresh_token';
export const PROVIDER_ACTIVE_ID_KEY = 'nexus.provider.active_id';
export const LOCALE_KEY = 'nexus.locale';

export const SUPPORTED_LOCALES = ['en', 'vi'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const ROUTES = {
  home: '/',
  properties: '/properties',
  dashboard: '/dashboard',
  admin: '/admin',
  profile: '/profile',
  signin: '/signin',
  signup: '/signup',
  listingNew: '/dashboard/listings/new',
} as const;

export const NAV_LINKS = [
  { href: ROUTES.properties, labelKey: 'nav.properties' },
  { href: `${ROUTES.properties}?purpose=rent`, labelKey: 'nav.forRent' },
] as const;
