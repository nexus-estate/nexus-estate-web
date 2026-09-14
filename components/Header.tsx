'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { useAuth } from '@/hooks/use-auth';
export default function Header() {
  const t = useTranslations('customer.nav');
  const { user, status, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    [t('home'), '/'],
    [t('properties'), '/properties'],
    [t('account'), '/profile'],
    [t('provider'), '/provider'],
  ];
  const signedIn = status === 'authenticated' && user;
  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071b1b]/95 text-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link
          href="/"
          className="font-display text-xl tracking-wide"
          aria-label="Nexus Estate"
        >
          NEXUS
        </Link>
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label={t('navigation')}
        >
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-white/80 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden w-28 sm:block">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                className="border border-white/25 px-3 py-2 text-sm"
              >
                {user.email}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 border border-[var(--border)] bg-white py-1 text-[var(--text)] shadow-lg">
                  <Link
                    className="block px-3 py-2 text-sm hover:bg-[var(--surface-subtle)]"
                    href="/profile"
                  >
                    {t('account')}
                  </Link>
                  <Link
                    className="block px-3 py-2 text-sm hover:bg-[var(--surface-subtle)]"
                    href="/provider"
                  >
                    {t('provider')}
                  </Link>
                  <button
                    className="w-full border-t px-3 py-2 text-left text-sm text-red-700"
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
              <Link href="/signin" className="px-3 py-2 text-sm">
                {t('signIn')}
              </Link>
              <Link
                href="/signup"
                className="border border-[#c7a66b] px-3 py-2 text-sm"
              >
                {t('signUp')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="lg:hidden"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          className="border-t border-white/10 bg-[#071b1b] px-5 py-4 lg:hidden"
          aria-label={t('navigation')}
        >
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block border-b border-white/10 py-3 text-sm"
            >
              {label}
            </Link>
          ))}
          {signedIn ? (
            <button
              className="py-3 text-left text-sm"
              onClick={() => {
                void logout();
                setMobileOpen(false);
              }}
            >
              {t('signOut')}
            </button>
          ) : (
            <div className="flex gap-4 py-3">
              <Link href="/signin">{t('signIn')}</Link>
              <Link href="/signup">{t('signUp')}</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
