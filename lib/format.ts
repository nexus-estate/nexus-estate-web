/**
 * Formatting helpers.
 *
 * Currency/date/number formatting was previously re-implemented with raw
 * `Intl` calls across pages, which drifted (styles, fraction digits, time
 * zones). Everything user-facing goes through here.
 */

export const DEFAULT_CURRENCY = 'VND';

export function formatCurrency(
  value: number | null | undefined,
  locale: string,
  options: { currency?: string; fallback?: string } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options.fallback ?? '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: options.currency ?? DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact price for dense lists: 3.5B ₫ instead of 3.500.000.000 ₫. */
export function formatCompactCurrency(
  value: number | null | undefined,
  locale: string,
  options: { currency?: string; fallback?: string } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options.fallback ?? '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: options.currency ?? DEFAULT_CURRENCY,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(
  value: number | null | undefined,
  locale: string,
  fallback = '—',
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(
  value: string | Date | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  fallback = '—',
): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: string,
  fallback = '—',
): string {
  return formatDate(
    value,
    locale,
    { dateStyle: 'medium', timeStyle: 'short' },
    fallback,
  );
}

export function formatArea(
  value: number | null | undefined,
  locale: string,
  fallback = '—',
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return `${formatNumber(value, locale)} m²`;
}
