'use client';

import { useRouter } from 'next/navigation';
import {
  useLocale,
  useTranslations as useNextIntlTranslations,
} from 'next-intl';

export type Locale = 'vi' | 'en';
export const LOCALES: Locale[] = ['vi', 'en'];
export const LOCALE_COOKIE = 'nexus.locale';

/** Compatibility hook for legacy screens; catalogues live only under messages/. */
export function useTranslations() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const translate = useNextIntlTranslations();
  const setLocale = (next: Locale) => {
    if (!LOCALES.includes(next)) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LOCALE_COOKIE, next);
    router.refresh();
  };
  return { locale, setLocale, t: (key: string) => translate(key) };
}
