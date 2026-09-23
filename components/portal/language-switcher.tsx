'use client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LOCALE_KEY, SUPPORTED_LOCALES, type Locale } from '@/lib/constants';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations('common');
  const nextLocale: Locale = locale === 'vi' ? 'en' : 'vi';

  const change = () => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    document.cookie = `${LOCALE_KEY}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem(LOCALE_KEY, nextLocale);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={change}
      aria-label={t('actions.switchLanguage')}
      className="btn btn-secondary btn-sm"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
      {locale === 'vi' ? t('language.english') : t('language.vietnamese')}
    </button>
  );
}
