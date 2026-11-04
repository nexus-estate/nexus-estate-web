'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { Panel, SectionHeader } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import { providerReviewApi } from '@/lib/api/administration/provider-review.api';
import { listingApi } from '@/lib/api/listing/listing.api';

type Shortcut = { href: string; title: string; description: string };

export default function AdminPage() {
  const {
    authorization,
    authorizationReady,
    hasPermission,
    refreshAuthorization,
  } = useAdministrationSession();
  const t = useTranslations('administration');
  const format = useFormatter();
  const canReviewProviders = hasPermission('provider-account:approve');
  const canReadSubjects = hasPermission('authorization:assignment:read');
  const canReadAudit = hasPermission('authorization:audit:read');
  const requests = useQuery({
    queryKey: ['administration', 'provider-requests'],
    queryFn: providerReviewApi.pending,
    enabled: authorizationReady && canReviewProviders,
  });
  const customers = useQuery({
    queryKey: ['administration', 'dashboard', 'customers'],
    queryFn: () =>
      administrationAuthorizationApi.subjects('MARKETPLACE', {
        page: 1,
        limit: 1,
      }),
    enabled: authorizationReady && canReadSubjects,
  });
  const memberships = useQuery({
    queryKey: ['administration', 'dashboard', 'memberships'],
    queryFn: () =>
      administrationAuthorizationApi.subjects('PROVIDER', {
        page: 1,
        limit: 1,
      }),
    enabled: authorizationReady && canReadSubjects,
  });
  const listings = useQuery({
    queryKey: ['administration', 'dashboard', 'published-listings'],
    queryFn: () => listingApi.list({ page: 1, limit: 1 }),
    enabled: authorizationReady,
  });
  const audit = useQuery({
    queryKey: ['administration', 'authorization', 'audit', 'dashboard'],
    queryFn: () => administrationAuthorizationApi.audit({ page: 1, limit: 5 }),
    enabled: authorizationReady && canReadAudit,
  });
  const shortcuts = [
    canReviewProviders && {
      href: '/admin/provider-requests',
      title: t('nav.providerReview'),
      description: t('overview.reviewProviders'),
    },
    hasPermission('authorization:role:read') && {
      href: '/admin/authorization',
      title: t('nav.roles'),
      description: t('overview.manageRoles'),
    },
    canReadSubjects && {
      href: '/admin/authorization/subjects',
      title: t('nav.subjects'),
      description: t('overview.manageAssignments'),
    },
    canReadAudit && {
      href: '/admin/authorization/audit',
      title: t('nav.audit'),
      description: t('overview.reviewAudit'),
    },
  ].filter(Boolean) as Shortcut[];
  const metric = (query: {
    isLoading: boolean;
    isError: boolean;
    data?: { meta: { total: number } };
  }) =>
    query.isLoading
      ? '…'
      : query.isError
        ? '—'
        : (query.data?.meta.total ?? '—');

  return (
    <div>
      <PageHeader
        title={t('overview.title')}
        description={t('overview.description')}
        actions={
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
            <span
              className={`h-2 w-2 rounded-full ${authorizationReady ? 'bg-emerald-600' : 'bg-amber-500'}`}
              aria-hidden="true"
            />
            {authorizationReady
              ? t('overview.accessActive')
              : t('overview.accessSyncing')}
          </span>
        }
      />
      {!authorizationReady && (
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          <p>{t('overview.authorizationUnavailable')}</p>
          <button
            className="rounded-md border border-amber-500 px-3 py-2 font-semibold hover:bg-amber-100"
            onClick={() => void refreshAuthorization().catch(() => undefined)}
          >
            {t('overview.retryAuthorization')}
          </button>
        </div>
      )}

      <section
        aria-label={t('overview.summary')}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <Metric
          label={t('overview.assignedRoles')}
          value={authorization?.roles.length ?? '—'}
          detail={t('overview.currentAdministrator')}
        />
        <Metric
          label={t('authorization.permissions')}
          value={authorization?.permissions.length ?? '—'}
          detail={t('overview.effectivePermissions')}
        />
        {canReviewProviders && (
          <Metric
            label={t('overview.pendingProviderRequests')}
            value={
              requests.isLoading
                ? '…'
                : requests.isError
                  ? '—'
                  : (requests.data?.length ?? 0)
            }
            detail={t('overview.awaitingApproval')}
            href="/admin/provider-requests"
          />
        )}
        {canReadSubjects && (
          <>
            <Metric
              label={t('overview.customerAccounts')}
              value={metric(customers)}
              detail={t('overview.marketplaceSubjects')}
            />
            <Metric
              label={t('overview.providerMembers')}
              value={metric(memberships)}
              detail={t('overview.providerSubjects')}
            />
          </>
        )}
        <Metric
          label={t('overview.publishedListings')}
          value={metric(listings)}
          detail={t('overview.publicCatalog')}
        />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        {canReviewProviders && (
          <Panel className="overflow-hidden">
            <SectionHeader
              title={t('overview.pendingProviderRequests')}
              description={t('overview.reviewProviders')}
              actions={
                <Link
                  href="/admin/provider-requests"
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  {t('overview.viewAllRequests')} →
                </Link>
              }
            />
            {requests.isLoading ? (
              <p className="p-5 text-sm text-[var(--text-muted)]">
                {t('providerReview.loading')}
              </p>
            ) : requests.isError ? (
              <div className="flex items-center justify-between gap-3 p-5 text-sm">
                <span>{t('providerReview.error')}</span>
                <button
                  className="font-semibold text-[var(--primary)] hover:underline"
                  onClick={() => void requests.refetch()}
                >
                  {t('overview.retry')}
                </button>
              </div>
            ) : requests.data?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="px-5">{t('providerReview.provider')}</th>
                      <th className="px-5">{t('providerReview.owner')}</th>
                      <th className="px-5">{t('providerReview.created')}</th>
                      <th className="px-5 text-right">
                        {t('providerReview.review')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.data.slice(0, 5).map((request) => (
                      <tr
                        className="border-t border-[var(--border-muted)]"
                        key={request.id}
                      >
                        <td className="px-5 py-3 font-semibold">
                          {request.providerAccount.displayName}
                        </td>
                        <td className="px-5 py-3 text-[var(--text-muted)]">
                          {request.owner.email}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-[var(--text-muted)]">
                          {format.dateTime(
                            new Date(request.providerAccount.createdAt),
                            { dateStyle: 'medium' },
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/admin/provider-requests/${request.id}`}
                            className="font-semibold text-[var(--primary)] hover:underline"
                          >
                            {t('providerReview.viewDetails')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-5 text-sm text-[var(--text-muted)]">
                {t('providerReview.empty')}
              </p>
            )}
          </Panel>
        )}
        <Panel className="overflow-hidden">
          <SectionHeader
            title={t('overview.quickActions')}
            description={t('overview.quickActionsDescription')}
          />
          {shortcuts.length ? (
            <div className="divide-y divide-[var(--border-muted)]">
              {shortcuts.map((shortcut) => (
                <Link
                  href={shortcut.href}
                  key={shortcut.href}
                  className="group flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[var(--surface-hover)]"
                >
                  <span>
                    <span className="block text-sm font-semibold group-hover:text-[var(--primary)]">
                      {shortcut.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                      {shortcut.description}
                    </span>
                  </span>
                  <span
                    className="text-[var(--text-subtle)]"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-5 text-sm text-[var(--text-muted)]">
              {t('overview.noQuickActions')}
            </p>
          )}
        </Panel>
      </div>

      {canReadAudit && (
        <Panel className="mt-6 overflow-hidden">
          <SectionHeader
            title={t('overview.recentActivity')}
            description={t('overview.recentActivityDescription')}
            actions={
              <Link
                href="/admin/authorization/audit"
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                {t('overview.viewAllActivity')} →
              </Link>
            }
          />
          {audit.isLoading ? (
            <p className="p-5 text-sm text-[var(--text-muted)]">
              {t('authorization.loading')}
            </p>
          ) : audit.isError ? (
            <div className="flex items-center justify-between gap-3 p-5 text-sm">
              <span>{t('authorization.error')}</span>
              <button
                className="font-semibold text-[var(--primary)] hover:underline"
                onClick={() => void audit.refetch()}
              >
                {t('overview.retry')}
              </button>
            </div>
          ) : audit.data?.items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-5">{t('authorization.time')}</th>
                    <th className="px-5">{t('authorization.action')}</th>
                    <th className="px-5">{t('authorization.platform')}</th>
                    <th className="px-5">{t('authorization.actor')}</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.data.items.map((event) => (
                    <tr
                      key={event.id}
                      className="border-t border-[var(--border-muted)]"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--text-muted)]">
                        {event.createdAt
                          ? format.dateTime(new Date(event.createdAt), {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {event.action || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          status={event.platform}
                          label={event.platform}
                          size="sm"
                        />
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--text-muted)]">
                        {event.actorAdministratorId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-5 text-sm text-[var(--text-muted)]">
              {t('authorization.noAudit')}
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number | string;
  detail: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">
        {label}
      </span>
      <strong className="mt-3 block text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]">
        {value}
      </strong>
      <span className="mt-2 block text-xs text-[var(--text-muted)]">
        {detail}
      </span>
    </>
  );
  return href ? (
    <Link
      href={href}
      className="app-panel block p-5 transition-colors hover:border-[var(--border-interactive)] hover:bg-[var(--surface-hover)]"
    >
      {content}
    </Link>
  ) : (
    <Panel className="p-5">{content}</Panel>
  );
}
