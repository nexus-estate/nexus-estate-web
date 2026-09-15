'use client';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import type { ProviderAuthorization } from '@/lib/api/provider/types';
export default function ProviderAuthorizationPage() {
  const t = useTranslations('provider');
  const auth = useProviderAuthorization();
  const stateLabel = {
    LOADING: t('state.loading'),
    ERROR: t('state.error'),
    NO_PROVIDER: t('state.noProvider'),
    PENDING_VERIFICATION: t('state.pendingVerification'),
    REJECTED: t('state.rejected'),
    SUSPENDED: t('state.suspended'),
    ACTIVE_VERIFIED: t('state.activeVerified'),
    CONTEXT_REQUIRED: t('state.contextRequired'),
  }[auth.state];
  return (
    <>
      <PageHeader
        title={t('authorization.title')}
        description={t('authorization.description')}
      />
      <Panel className="p-6">
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          {t('authorization.scopeNote')}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">
              {t('authorization.membership')}
            </span>
            <p className="mt-1 font-medium">
              {auth.data?.membershipStatus ? (
                <StatusBadge
                  status={auth.data.membershipStatus}
                  label={t(
                    `status.${auth.data.membershipStatus.toLowerCase()}`,
                  )}
                />
              ) : (
                '—'
              )}
            </p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">
              {t('authorization.providerId')}
            </span>
            <p className="mt-1 font-medium">{auth.data?.providerId ?? '—'}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">
              {t('authorization.state')}
            </span>
            <p className="mt-1 font-medium">{stateLabel}</p>
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
      </Panel>
    </>
  );
}
