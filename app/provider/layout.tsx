'use client';
import { useTranslations } from 'next-intl';
import { PortalShell } from '@/components/portal/portal-shell';
import { ProviderContextProvider } from '@/features/provider/context/provider-context.provider';
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('provider');
  return (
    <ProviderContextProvider>
      <PortalShell
        platform={t('title')}
        items={[
          { label: t('nav.overview'), href: '/provider' },
          { label: t('nav.account'), href: '/provider/account' },
          { label: t('nav.authorization'), href: '/provider/authorization' },
        ]}
      >
        {children}
      </PortalShell>
    </ProviderContextProvider>
  );
}
