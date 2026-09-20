'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { useAuth } from '@/hooks/use-auth';
import { getProviderUrl } from '@/lib/platform/urls';

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
    { label: t('provider'), href: getProviderUrl('/provider') },
  ];
  const signedIn = status === 'authenticated' && user;

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--brand-strong)]/96 text-[var(--text-on-dark)] shadow-[var(--shadow-xs)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-display text-xl tracking-wide"
          aria-label={t('brand')}
        >
          NEXUS
        </Link>
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            href.startsWith('http') ? (
              <a
                key={href}
                href={href}
                className="text-sm text-white/75 transition-colors hover:text-white"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="text-sm text-white/75 transition-colors hover:text-white"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden w-28 sm:block [&_button]:border-white/15 [&_button]:bg-white/5 [&_button]:text-white/75 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                className="rounded-[var(--radius-md)] border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
              >
                {user.email}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] py-1 text-[var(--text)] shadow-[var(--shadow-md)]">
                  <Link
                    className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                    href="/profile"
                  >
                    {t('account')}
                  </Link>
                  <a
                    className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                    href={getProviderUrl('/provider')}
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
              <Link
                href="/signin"
                className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/signup"
                className="rounded-[var(--radius-md)] border border-[var(--brand-accent)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-accent)] hover:text-[var(--brand-strong)]"
              >
                {t('signUp')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="rounded-[var(--radius-md)] p-2 transition-colors hover:bg-white/10 lg:hidden"
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
          className="border-t border-white/10 bg-[var(--brand-strong)] px-5 py-4 shadow-[var(--shadow-md)] lg:hidden"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            href.startsWith('http') ? (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-white/10 py-3 text-sm text-white/80 transition-colors hover:text-white"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-white/10 py-3 text-sm text-white/80 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ),
          )}
          {signedIn ? (
            <button
              className="py-3 text-left text-sm text-white/80"
              onClick={() => {
                void logout();
                setMobileOpen(false);
              }}
            >
              {t('signOut')}
            </button>
          ) : (
            <div className="flex gap-4 py-3 text-sm">
              <Link href="/signin">{t('signIn')}</Link>
              <Link href="/signup">{t('signUp')}</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
