'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { NexusBrand } from '@/components/portal/nexus-brand';
import { getProviderUrl } from '@/lib/platform/urls';

export default function Footer() {
  const t = useTranslations('common.footer');
  return (
    <footer className="mp-footer">
      <div className="mp-container">
        <div className="mp-footer-top">
          <Link href="/">
            <NexusBrand marketplace />
          </Link>
          <nav aria-label={t('explore')}>
            <Link href="/properties?purpose=SALE">{t('forSale')}</Link>
            <Link href="/properties?purpose=RENT">{t('forRent')}</Link>
            <Link href="/properties?type=VILLA">{t('villas')}</Link>
            <a href={getProviderUrl('/provider/onboarding')}>
              {t('becomeProvider')}
            </a>
          </nav>
        </div>
        <p className="mp-footer-copyright">
          © {new Date().getFullYear()} Nexus Estate. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
