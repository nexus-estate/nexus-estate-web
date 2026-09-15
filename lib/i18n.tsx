'use client';

import { useRouter } from 'next/navigation';
import {
  useLocale,
  useTranslations as useNextIntlTranslations,
} from 'next-intl';
import { LOCALE_KEY, LOCALES, type Locale } from '@/lib/constants';

export { LOCALE_KEY as LOCALE_COOKIE, LOCALES };
export type { Locale };

/** Compatibility hook for legacy screens; catalogues live only under messages/. */
export function useTranslations() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const translate = useNextIntlTranslations();
  const setLocale = (next: Locale) => {
    if (!LOCALES.includes(next)) return;
    document.cookie = `${LOCALE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LOCALE_KEY, next);
    router.refresh();
  };
  return { locale, setLocale, t: (key: string) => translate(key) };
}
