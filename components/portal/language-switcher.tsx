'use client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LOCALE_KEY, LOCALES, type Locale } from '@/lib/constants';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations('common');
  const nextLocale: Locale = locale === 'vi' ? 'en' : 'vi';

  const change = () => {
    if (!LOCALES.includes(nextLocale)) return;
    document.cookie = `${LOCALE_KEY}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem(LOCALE_KEY, nextLocale);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={change}
      aria-label={t('actions.switchLanguage')}
      className="mt-3 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
    >
      {locale === 'vi' ? t('language.english') : t('language.vietnamese')}
    </button>
  );
}
