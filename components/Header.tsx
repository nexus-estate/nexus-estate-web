'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { NexusBrand } from '@/components/portal/nexus-brand';
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
    <header className="sticky inset-x-0 top-0 z-50 border-b border-[#e8e7e1] bg-white/95 text-[var(--brand-strong)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]"
          aria-label={t('brand')}
        >
          <NexusBrand />
        </Link>
        <nav
          className="hidden h-full items-center gap-8 lg:flex"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            href.startsWith('http') ? (
              <a
                key={href}
                href={href}
                className="flex h-full items-center border-b-2 border-transparent text-sm font-medium text-[#5c6861] transition-colors hover:text-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex h-full items-center border-b-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${pathname === href ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[#5c6861] hover:text-[var(--brand)]'}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <a
            className="app-button app-button-primary hidden sm:inline-flex"
            href={getProviderUrl('/provider/properties/new')}
          >
            {t('postEstate')}
          </a>
          <div className="hidden w-28 sm:block [&_button]:border-[#d9ddd7] [&_button]:bg-white [&_button]:text-[var(--brand)] [&_button:hover]:bg-[#f4f5f0]">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                className="max-w-48 truncate border border-[#d9ddd7] px-3 py-2 text-sm font-medium transition-colors hover:bg-[#f4f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
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
                className="px-3 py-2 text-sm font-medium text-[var(--brand)] transition-colors hover:bg-[#f4f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
              >
                {t('signIn')}
              </Link>
              <Link href="/signup" className="app-button app-button-primary">
                {t('signUp')}
              </Link>
            </div>
          )}
          <button
            type="button"
            className="p-2 transition-colors hover:bg-[#f4f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] lg:hidden"
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
          className="border-t border-[#e8e7e1] bg-white px-5 py-4 shadow-[var(--shadow-md)] lg:hidden"
          aria-label={t('navigation')}
        >
          {nav.map(({ label, href }) =>
            href.startsWith('http') ? (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-[#e8e7e1] py-3 text-sm text-[var(--brand)] transition-colors hover:bg-[#f4f5f0]"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-[#e8e7e1] py-3 text-sm text-[var(--brand)] transition-colors hover:bg-[#f4f5f0]"
              >
                {label}
              </Link>
            ),
          )}
          <a
            href={getProviderUrl('/provider/properties/new')}
            className="app-button app-button-primary my-3 w-full"
            onClick={() => setMobileOpen(false)}
          >
            {t('postEstate')}
          </a>
          {signedIn ? (
            <button
              className="py-3 text-left text-sm text-[var(--brand)]"
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
