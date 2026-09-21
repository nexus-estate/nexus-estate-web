'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getProviderUrl } from '@/lib/platform/urls';

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
    <footer className="bg-[var(--brand-strong)] text-[var(--text-on-dark)]">
      <div className="mx-auto max-w-[var(--content-max)] px-5 pb-8 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_.65fr_.65fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3">
              <svg
                viewBox="0 0 42 42"
                fill="none"
                className="h-9 w-9 text-[var(--brand-accent)]"
                aria-hidden="true"
              >
                <path
                  d="M7 34V16L21 6l14 10v18M13 34V19.5L21 14l8 5.5V34M3 34h36"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M18 34V23h6v11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span>
                <strong className="block font-display text-xl font-normal tracking-[0.04em]">
                  NEXUS
                </strong>
                <small className="block text-[8px] uppercase tracking-[0.28em] text-white/45">
                  Estate Collection
                </small>
              </span>
            </Link>
            <p className="mt-6 text-sm leading-7 text-white/55">
              {t('tagline')}
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.titleKey}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                {t(group.titleKey)}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/provider') ? (
                      <a
                        href={getProviderUrl(href)}
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {t(label)}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-white/55 transition-colors hover:text-white"
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
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
              {t('connect')}
            </h2>
            <p className="mt-5 text-sm leading-6 text-white/55">
              {t('newsletter')}
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-5 flex border-b border-white/25 focus-within:border-[var(--brand-accent)]"
            >
              <input
                type="email"
                aria-label={t('newsletterLabel')}
                placeholder={t('newsletterPlaceholder')}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                aria-label={t('newsletterSubmit')}
                className="px-3 text-[var(--brand-accent)] transition-colors hover:text-white"
              >
                →
              </button>
            </form>
            <p className="mt-6 text-sm text-white/55">
              support@nexusestate.dev
              <br />
              1900 1234
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[10px] uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Nexus Estate. {t('rights')}
          </p>
          <div className="flex gap-6">
            <Link className="transition-colors hover:text-white/70" href="/">
              {t('privacy')}
            </Link>
            <Link className="transition-colors hover:text-white/70" href="/">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
