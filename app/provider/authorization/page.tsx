'use client';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import type { ProviderAuthorization } from '@/lib/api/provider/types';
export default function ProviderAuthorizationPage() {
  const t = useTranslations('provider');
  const auth = useProviderAuthorization();
  return (
    <>
      <PageHeader
        title={t('authorization.title')}
        description={t('authorization.description')}
      />
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          These roles apply to this Provider membership, not to your Customer
          account globally.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">Membership</span>
            <p className="mt-1 font-medium">
              {auth.data?.membershipStatus ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">
              Provider ID
            </span>
            <p className="mt-1 font-medium">{auth.data?.providerId ?? '—'}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">State</span>
            <p className="mt-1 font-medium">{auth.state}</p>
          </div>
        </div>
        <h2 className="mt-8 text-sm font-medium">
          {t('authorization.permissions')}
        </h2>
        <div className="mt-3 space-y-4">
          {Object.entries(
            (auth.data?.permissions ?? []).reduce<
              Record<string, ProviderAuthorization['permissions']>
            >((groups, permission) => {
              const key = permission.category;
              (groups[key] ??= []).push(permission);
              return groups;
            }, {}),
          ).map(([category, permissions]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                {category}
              </h3>
              <div className="mt-2 space-y-2">
                {permissions.map((p) => (
                  <div
                    className="flex items-baseline justify-between border-b border-[var(--border)] py-2 text-sm"
                    key={p.code}
                  >
                    <span>{p.name}</span>
                    <code className="text-xs text-[var(--text-muted)]">
                      {p.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
