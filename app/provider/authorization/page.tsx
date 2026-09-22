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
      <Panel className="p-5 sm:p-6">
        <p className="text-sm text-[var(--text-muted)]">
          {t('authorization.scopeNote')}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <span className="label-caps">{t('authorization.membership')}</span>
            <p className="mt-1.5">
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
            <span className="label-caps">{t('authorization.providerId')}</span>
            <p className="mt-1.5 break-all font-mono text-xs text-[var(--text)]">
              {auth.data?.providerId ?? '—'}
            </p>
          </div>
          <div>
            <span className="label-caps">{t('authorization.state')}</span>
            <p className="mt-1.5 text-sm font-medium text-[var(--text)]">
              {stateLabel}
            </p>
          </div>
        </div>
        <h2 className="mt-8 text-sm font-semibold text-[var(--text)]">
          {t('authorization.permissions')}
        </h2>
        <div className="mt-3 space-y-5">
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
              <h3 className="label-caps">{category}</h3>
              <div className="mt-2">
                {permissions.map((p) => (
                  <div
                    className="flex items-baseline justify-between gap-4 border-b border-[var(--border-muted)] py-2 text-sm last:border-0"
                    key={p.code}
                  >
                    <span className="text-[var(--text)]">{p.name}</span>
                    <code className="font-mono text-xs text-[var(--text-muted)]">
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
