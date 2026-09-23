'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { useAuth } from '@/hooks/use-auth';
import { getProviderHref, isCrossOriginHref } from '@/lib/platform/urls';

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span
        className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-[var(--text-on-accent)]"
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
    </span>
  );
}

export default function Header() {
  const t = useTranslations('customer.nav');
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { label: t('home'), href: '/' },
    { label: t('properties'), href: '/properties' },
    { label: t('account'), href: '/profile' },
    { label: t('provider'), href: getProviderHref('/provider') },
  ];
  const signedIn = status === 'authenticated' && user;

  const navLinkClass = (href: string) =>
    `rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors ${
      pathname === href
        ? 'bg-[var(--primary-soft)] font-semibold text-[var(--primary)]'
        : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
    }`;

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label={t('brand')}>
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            isCrossOriginHref(href) ? (
              <a key={href} href={href} className={navLinkClass(href)}>
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={navLinkClass(href)}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                className="btn btn-secondary"
              >
                {user.email}
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 text-[var(--text-subtle)]"
                  aria-hidden="true"
                >
                  <path
                    d="M5 8l5 5 5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-raised)] py-1 shadow-[var(--shadow-md)]">
                  <Link
                    className="block px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
                    href="/profile"
                  >
                    {t('account')}
                  </Link>
                  <a
                    className="block px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
                    href={getProviderHref('/provider')}
                  >
                    {t('provider')}
                  </a>
                  <button
                    className="w-full border-t border-[var(--border-muted)] px-3 py-2 text-left text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
                    onClick={() => {
                      void logout();
                      setAccountOpen(false);
                    }}
                  >
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link href="/signin" className="btn btn-secondary">
                {t('signIn')}
              </Link>
              <Link href="/signup" className="btn btn-primary">
                {t('signUp')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost px-2 lg:hidden"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="animate-fade-in border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            isCrossOriginHref(href) ? (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              >
                {label}
              </Link>
            ),
          )}
          <div className="mt-2 flex items-center gap-2 border-t border-[var(--border-muted)] pt-3">
            <LanguageSwitcher />
            {!signedIn && (
              <>
                <Link href="/signin" className="btn btn-secondary flex-1">
                  {t('signIn')}
                </Link>
                <Link href="/signup" className="btn btn-primary flex-1">
                  {t('signUp')}
                </Link>
              </>
            )}
            {signedIn && (
              <button
                className="btn btn-danger flex-1"
                onClick={() => {
                  void logout();
                  setMobileOpen(false);
                }}
              >
                {t('signOut')}
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
