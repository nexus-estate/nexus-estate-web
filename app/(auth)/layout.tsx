'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('auth.customer');
  const commonT = useTranslations('common');
  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[1fr_1.1fr]">
      <section className="hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] px-12 py-10 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-[var(--text-on-accent)]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
              <path
                d="M4 20V9.5L12 4l8 5.5V20M9 20v-6h6v6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight text-[var(--text)]">
            Nexus Estate
          </span>
        </Link>
        <div className="max-w-md">
          <blockquote className="text-2xl font-semibold leading-snug tracking-tight text-[var(--text)]">
            {t('heroQuote')}
          </blockquote>
          <p className="label-caps mt-6">{t('heroCollection')}</p>
        </div>
        <p className="text-xs text-[var(--text-subtle)]">
          {commonT('footer.rights')}
        </p>
      </section>

      <section className="relative flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-[var(--text-on-accent)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 20V9.5L12 4l8 5.5V20M9 20v-6h6v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Nexus Estate
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
          >
            {commonT('navigation.home')}
          </Link>
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </section>
    </main>
  );
}
