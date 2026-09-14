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

export const LOCALES = ['en', 'vi'] as const;
export const DEFAULT_LOCALE = 'vi';

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'area-asc', label: 'Diện tích: Nhỏ đến Lớn' },
  { value: 'area-desc', label: 'Diện tích: Lớn đến Nhỏ' },
];

export const PROPERTY_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà phố' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
];

export const PURPOSES: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'buy', label: 'Bán' },
  { value: 'rent', label: 'Cho thuê' },
];

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

export const AUTH_NAV_LINKS = [
  {
    href: ROUTES.dashboard,
    labelKey: 'nav.dashboard',
    roles: ['ADMIN', 'BROKER', 'BUYER'],
  },
  { href: ROUTES.admin, labelKey: 'nav.admin', roles: ['ADMIN'] },
] as const;
