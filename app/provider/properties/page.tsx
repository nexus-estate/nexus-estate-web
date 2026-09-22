'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useArchiveProviderProperty,
  useProviderProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { Estate } from '@/lib/api/estate/estate.types';

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProviderPropertiesPage() {
  const locale = useLocale();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const properties = useProviderProperties(
    workspace.hasProviderPermission('property:read'),
  );
  const archiveProperty = useArchiveProviderProperty();

  const canCreate = workspace.hasProviderPermission('property:create');
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const canArchive = workspace.hasProviderPermission('property:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';

  return (
    <>
      <PageHeader
        title={t('properties.title')}
        description={t('properties.description')}
        actions={
          <Link
            href="/provider/properties/new"
            aria-disabled={!canCreate}
            className={`inline-flex bg-[var(--primary)] px-4 py-2 text-sm text-white ${
              canCreate ? 'hover:opacity-90' : 'pointer-events-none opacity-50'
            }`}
          >
            {t('properties.new')}
          </Link>
        }
      />
      {workspace.state === 'LOADING' ? (
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      ) : blockedByLifecycle ? (
        <p className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      ) : !canRead ? (
        <p
          role="alert"
          className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]"
        >
          {t('permissionDenied')}
        </p>
      ) : properties.isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      ) : properties.isError ? (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {properties.error instanceof ApiError &&
          properties.error.status === 403
            ? t('permissionDenied')
            : t('properties.loadFailed')}
        </p>
      ) : (properties.data?.length ?? 0) === 0 ? (
        <div className="border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
          {t('properties.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-muted)] border border-[var(--border)] bg-[var(--surface)]">
          {(properties.data ?? []).map((estate: Estate) => (
            <li
              key={estate.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {estate.title}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {formatPrice(estate.price, locale)} · {estate.province.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canUpdate && (
                  <Link
                    href={`/provider/properties/${estate.id}/edit`}
                    className="border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-hover)]"
                  >
                    {t('properties.edit')}
                  </Link>
                )}
                {canArchive && (
                  <button
                    type="button"
                    disabled={archiveProperty.isPending}
                    onClick={() => archiveProperty.mutate(estate.id)}
                    className="border border-[var(--danger)] px-3 py-1.5 text-xs font-medium text-[var(--danger)] disabled:opacity-50"
                  >
                    {t('properties.archive')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {archiveProperty.isError && (
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {archiveProperty.error instanceof ApiError &&
          archiveProperty.error.status === 403
            ? t('permissionDenied')
            : t('properties.archiveFailed')}
        </p>
      )}
    </>
  );
}
