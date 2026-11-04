'use client';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LOCALE_KEY, SUPPORTED_LOCALES, type Locale } from '@/lib/constants';

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
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
      className={`mt-3 w-full rounded-[var(--radius-md)] border px-3 py-2 text-left text-xs font-medium transition-colors ${dark ? 'border-white/10 bg-white/[0.05] text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'}`}
    >
      {locale === 'vi' ? t('language.english') : t('language.vietnamese')}
    </button>
  );
}
