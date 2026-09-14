'use client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/lib/api/core/client';
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations('common');
  const nextLocale = locale === 'vi' ? 'en' : 'vi';
  const change = () => {
    document.cookie = `nexus.locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem('nexus.locale', nextLocale);
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={change}
      aria-label={t('actions.switchLanguage')}
      className="mt-3 w-full rounded-md border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
    >
      {locale === 'vi' ? t('language.english') : t('language.vietnamese')}
    </button>
  );
}
