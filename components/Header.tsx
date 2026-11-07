'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { NexusBrand } from '@/components/portal/nexus-brand';
import { useAuth } from '@/hooks/use-auth';
import { getProviderUrl } from '@/lib/platform/urls';

export default function Header() {
  const t = useTranslations('customer.nav');
  const customerT = useTranslations('customer');
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const signedIn = status === 'authenticated' && user;
  const nav = [
    { label: t('buy'), href: '/properties?purpose=SALE' },
    { label: t('rent'), href: '/properties?purpose=RENT' },
    { label: t('properties'), href: '/properties' },
    { label: t('providers'), href: getProviderUrl('/provider') },
  ];
  const links = nav.map(({ label, href }) =>
    href.startsWith('http') ? (
      <a key={href} href={href} onClick={() => setMobileOpen(false)}>
        {label}
      </a>
    ) : (
      <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
        {label}
      </Link>
    ),
  );
  return (
    <header
      className="mp-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setAccountOpen(false);
          setMobileOpen(false);
        }
      }}
    >
      <div className="mp-container mp-header-inner">
        <Link href="/" aria-label={t('brand')} className="mp-brand">
          <NexusBrand marketplace />
        </Link>
        <nav className="mp-desktop-nav" aria-label={t('navigation')}>
          {links}
        </nav>
        {pathname.startsWith('/properties/') && (
          <form action="/properties" className="mp-header-search">
            <label className="sr-only" htmlFor="header-search">
              {customerT('properties.search')}
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder={customerT('home.marketplaceSearchPlaceholder')}
            />
            <button type="submit" aria-label={customerT('properties.search')}>
              <MarketplaceIcon name="search" />
            </button>
          </form>
        )}
        <div className="mp-header-actions">
          <div className="mp-header-language">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setAccountOpen(false);
              }}
            >
              <button
                className="mp-account-button"
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                aria-controls="marketplace-account"
              >
                {user.email}
              </button>
              {accountOpen && (
                <div id="marketplace-account" className="mp-account-menu">
                  <Link href="/profile" onClick={() => setAccountOpen(false)}>
                    {t('account')}
                  </Link>
                  <a href={getProviderUrl('/provider')}>{t('provider')}</a>
                  <a href={getProviderUrl('/provider/properties/new')}>
                    {t('postEstate')}
                  </a>
                  <button
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
            <div className="mp-auth">
              <Link href="/signin">{t('signIn')}</Link>
              <Link href="/signup" className="mp-button">
                {t('signUp')}
              </Link>
            </div>
          )}
          <button
            className="mp-menu-toggle"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="marketplace-mobile-nav"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MarketplaceIcon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="marketplace-mobile-nav"
          className="mp-mobile-nav mp-container"
          aria-label={t('navigation')}
        >
          {links}
          <a href={getProviderUrl('/provider/properties/new')}>
            {t('postEstate')}
          </a>
          {signedIn ? (
            <Link href="/profile" onClick={() => setMobileOpen(false)}>
              {t('account')}
            </Link>
          ) : (
            <div className="flex gap-5">
              <Link href="/signin" onClick={() => setMobileOpen(false)}>
                {t('signIn')}
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                {t('signUp')}
              </Link>
            </div>
          )}
          <div className="w-32 py-3">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
