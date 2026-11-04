'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PortalShell } from '@/components/portal/portal-shell';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';
import { useAuth } from '@/hooks/use-auth';
import { getMarketplaceUrl } from '@/lib/platform/urls';
import './provider.css';
export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('provider');
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { status, logout } = useAuth();
  const workspace = useProviderEntryState(status === 'authenticated');
  const permissions = new Set(
    workspace.authorization.data?.permissions.map(
      (permission) => permission.code,
    ) ?? [],
  );
  const hasAnyPermission = (...codes: string[]) =>
    codes.some((code) => permissions.has(code));
  useEffect(() => {
    if (status !== 'anonymous') return;
    const query = search.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    router.replace(`/signin?next=${encodeURIComponent(current)}`);
  }, [pathname, router, search, status]);
  if (status === 'restoring')
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        {t('loading')}
      </div>
    );
  if (status === 'anonymous') return null;
  const identity = (
    <div className="mt-4 flex items-center gap-3 text-xs text-white/65">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 font-semibold text-white">
        {(workspace.account.data?.displayName ?? 'P').slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-white">
          {workspace.account.data?.displayName ?? t('identity.notEnrolled')}
        </span>
        <span className="mt-0.5 block">
          {workspace.account.data?.type
            ? t(`types.${workspace.account.data.type}`)
            : t('identity.providerPlatform')}
        </span>
      </span>
    </div>
  );
  const topbarContext = (
    <div className="flex items-center gap-2 text-sm font-semibold text-[#183b33]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#075b46] text-xs font-bold text-white">
        {(workspace.account.data?.displayName ?? 'P').slice(0, 2).toUpperCase()}
      </span>
      <span className="hidden max-w-40 truncate sm:inline">
        {workspace.account.data?.displayName ?? t('identity.providerPlatform')}
      </span>
    </div>
  );
  return (
    <div className="provider-portal">
      <PortalShell
        platform="Provider"
        appearance="administration"
        items={[
          {
            label: t('nav.overview'),
            href: '/provider',
            match: 'exact',
            icon: 'home',
          },
          ...(hasAnyPermission('listing:read', 'listing:create')
            ? [
                {
                  label: t('nav.listings'),
                  icon: 'tag' as const,
                  href: permissions.has('listing:read')
                    ? '/provider/listings'
                    : '/provider/listings/new',
                  match: 'prefix' as const,
                  children: permissions.has('listing:read')
                    ? [
                        {
                          label: t('listings.list'),
                          href: '/provider/listings',
                        },
                        ...(permissions.has('listing:create')
                          ? [
                              {
                                label: t('listings.new'),
                                href: '/provider/listings/new',
                              },
                            ]
                          : []),
                      ]
                    : undefined,
                },
              ]
            : []),
          ...(hasAnyPermission('property:read', 'property:create')
            ? [
                {
                  label: t('nav.properties'),
                  icon: 'building' as const,
                  href: permissions.has('property:read')
                    ? '/provider/properties'
                    : '/provider/properties/new',
                  match: 'prefix' as const,
                },
              ]
            : []),
          ...(permissions.has('property:read')
            ? [
                {
                  label: t('nav.media'),
                  icon: 'images' as const,
                  href: '/provider/media',
                  match: 'prefix' as const,
                },
              ]
            : []),
          ...(hasAnyPermission(
            'provider-account:read',
            'provider-account:update',
          )
            ? [
                {
                  label: t('nav.account'),
                  icon: 'key' as const,
                  href: '/provider/account',
                  match: 'prefix' as const,
                },
              ]
            : []),
          {
            label: t('nav.authorization'),
            icon: 'check',
            href: '/provider/authorization',
            match: 'exact',
          },
        ]}
        identity={identity}
        topbarContext={topbarContext}
        footer={
          <div className="mb-3 space-y-2 px-3 text-xs">
            <a className="block text-white/65" href={getMarketplaceUrl('/')}>
              {t('footer.back')}
            </a>
            <button className="text-red-200" onClick={() => void logout()}>
              {t('footer.signOut')}
            </button>
          </div>
        }
      >
        {children}
      </PortalShell>
    </div>
  );
}
