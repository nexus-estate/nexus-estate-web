'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getProviderHref } from '@/lib/platform/urls';

const groups = [
  {
    titleKey: 'explore',
    links: [
      ['forSale', '/properties?purpose=SALE'],
      ['forRent', '/properties?purpose=RENT'],
      ['curatedProjects', '/properties'],
      ['villas', '/properties?type=VILLA'],
    ],
  },
  {
    titleKey: 'nexusEstate',
    links: [
      ['about', '/'],
      ['becomeProvider', '/provider/onboarding'],
      ['consultation', '/signup'],
      ['signIn', '/signin'],
    ],
  },
];

export default function Footer() {
  const t = useTranslations('common.footer');
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[var(--content-max)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-[var(--border-muted)] pb-10 lg:grid-cols-[1.4fr_.7fr_.7fr_1.2fr]">
          <div className="max-w-sm">
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
              <span className="text-base font-semibold tracking-tight text-[var(--text)]">
                Nexus Estate
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
              {t('tagline')}
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.titleKey}>
              <h2 className="label-caps">{t(group.titleKey)}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/provider') ? (
                      <a
                        href={getProviderHref(href)}
                        className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                      >
                        {t(label)}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                      >
                        {t(label)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="label-caps">{t('connect')}</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
              {t('newsletter')}
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-3 flex gap-2"
            >
              <input
                type="email"
                aria-label={t('newsletterLabel')}
                placeholder={t('newsletterPlaceholder')}
                className="field flex-1"
              />
              <button
                type="submit"
                aria-label={t('newsletterSubmit')}
                className="btn btn-secondary btn-icon btn-lg self-start"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h11m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
            <p className="mt-5 text-sm text-[var(--text-muted)]">
              support@nexusestate.dev
              <br />
              1900 1234
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-[var(--text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Nexus Estate. {t('rights')}
          </p>
          <div className="flex gap-5">
            <Link
              className="transition-colors hover:text-[var(--text)]"
              href="/"
            >
              {t('privacy')}
            </Link>
            <Link
              className="transition-colors hover:text-[var(--text)]"
              href="/"
            >
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
