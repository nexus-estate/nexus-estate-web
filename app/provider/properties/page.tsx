'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { PageHeader } from '@/components/portal/page-header';
import { PropertyCard } from '@/components/provider/property/property-card';
import { Modal } from '@/components/ui/Modal';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderContext } from '@/features/provider/context/provider-context.provider';
import { providerKeys } from '@/features/provider/query-keys';
import { publicListings } from '@/features/provider/supply/property-visibility';
import {
  useActivateProviderProperty,
  useArchiveProviderProperty,
  useProviderProperties,
  useProviderListings,
  useRestoreProviderProperty,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import type { Estate } from '@/lib/api/estate/estate.types';

import './properties.css';

const PAGE_SIZE = 8;
const STATUSES = ['public', 'private'] as const;
const TYPES = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'TOWNHOUSE',
  'LAND',
  'OFFICE',
  'SHOPHOUSE',
  'WAREHOUSE',
  'COMMERCIAL',
  'HOTEL',
  'RESORT',
  'FARM',
  'OTHER',
] as const;

function InventorySkeleton() {
  const t = useTranslations('provider');
  return (
    <div role="status" aria-label={t('loading')} className="inventory-list">
      {[1, 2, 3].map((id) => (
        <div
          key={id}
          className="inventory-card inventory-skeleton"
          aria-hidden="true"
        >
          <div className="skeleton inventory-thumbnail" />
          <div>
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderPropertiesPage() {
  const { providerId } = useProviderContext();
  return <ProviderInventory key={providerId ?? 'implicit'} />;
}

function ProviderInventory() {
  const locale = useLocale();
  const t = useTranslations('provider');
  const search = useSearchParams();
  const query = search.get('q') ?? '';
  const statusFilter =
    STATUSES.find((status) => status === search.get('status')) ?? '';
  const typeFilter = TYPES.find((type) => type === search.get('type')) ?? '';
  const pageParam = Number(search.get('page'));
  const requestedPage =
    Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const [archiveTarget, setArchiveTarget] = useState<Estate | null>(null);
  const updateFilters = (values: Record<string, string>, replace = false) => {
    const params = new URLSearchParams(search.toString());
    params.delete('page');
    Object.entries(values).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    window.history[replace ? 'replaceState' : 'pushState'](
      null,
      '',
      `?${params.toString()}`,
    );
  };
  const workspace = useProviderAuthorization();
  const queryClient = useQueryClient();
  const { providerId } = useProviderContext();
  const properties = useProviderProperties(
    workspace.hasProviderPermission('property:read'),
  );
  const listings = useProviderListings(
    workspace.hasProviderPermission('listing:read'),
  );
  const visibilityReady =
    workspace.hasProviderPermission('listing:read') &&
    listings.isSuccess &&
    !listings.isError;
  const activateProperty = useActivateProviderProperty();
  const archiveProperty = useArchiveProviderProperty();
  const restoreProperty = useRestoreProviderProperty();

  const canCreate = workspace.hasProviderPermission('property:create');
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const canArchive = workspace.hasProviderPermission('property:archive');
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const [lifecycleError, setLifecycleError] = useState<unknown>(null);

  const pendingActionFor = (propertyId: string) => {
    if (activateProperty.isPending && activateProperty.variables === propertyId)
      return 'activate';
    if (archiveProperty.isPending && archiveProperty.variables === propertyId)
      return 'archive';
    if (restoreProperty.isPending && restoreProperty.variables === propertyId)
      return 'restore';
    return null;
  };

  const runLifecycle = (
    action: 'activate' | 'archive' | 'restore',
    propertyId: string,
  ) => {
    setLifecycleError(null);
    const options = {
      onSuccess: () => {
        setLifecycleError(null);
        setArchiveTarget(null);
      },
      onError: (error: unknown) => setLifecycleError(error),
    };
    if (action === 'activate') activateProperty.mutate(propertyId, options);
    if (action === 'archive') archiveProperty.mutate(propertyId, options);
    if (action === 'restore') restoreProperty.mutate(propertyId, options);
  };

  const lifecycleErrorMessage =
    lifecycleError instanceof ApiError && lifecycleError.status === 403
      ? t('permissionDenied')
      : lifecycleError instanceof ApiError &&
          lifecycleError.code === 'PROPERTY_ACTIVATION_INCOMPLETE'
        ? t('properties.activationIncomplete')
        : lifecycleError instanceof ApiError &&
            lifecycleError.code === 'PROPERTY_PUBLISHED_LISTING_CONFLICT'
          ? t('properties.publishedListingConflict')
          : lifecycleError instanceof ApiError &&
              lifecycleError.code === 'PROPERTY_INVALID_STATUS_TRANSITION'
            ? t('properties.invalidStatusTransition')
            : lifecycleError instanceof ApiError &&
                lifecycleError.code === 'LISTING_PROPERTY_NOT_ACTIVE'
              ? t('properties.listingPropertyNotActive')
              : t('properties.lifecycleFailed');

  const filtered = (properties.data ?? []).filter(
    (item) =>
      (!statusFilter ||
        !visibilityReady ||
        publicListings(item, listings.data ?? []).length > 0 ===
          (statusFilter === 'public')) &&
      (!typeFilter || item.type === typeFilter) &&
      item.title
        .toLocaleLowerCase(locale)
        .includes(query.trim().toLocaleLowerCase(locale)),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(query || statusFilter || typeFilter);
  const createLink = canCreate ? (
    <Link
      href="/provider/properties/new"
      className="provider-button provider-button-primary"
    >
      <span aria-hidden="true">＋</span>
      {t('properties.create')}
    </Link>
  ) : null;
  const refresh = () => {
    void properties.refetch();
    if (workspace.hasProviderPermission('listing:read'))
      void listings.refetch();
    void queryClient.invalidateQueries({
      queryKey: [...providerKeys.scope(providerId), 'estate-media'],
    });
  };

  return (
    <section className="property-inventory">
      <PageHeader
        title={t('properties.title')}
        description={t('properties.description')}
        actions={createLink}
      />
      {canRead && (
        <>
          <div
            className="inventory-tabs"
            role="group"
            aria-label={t('controls.status')}
          >
            {['', ...(visibilityReady ? STATUSES : [])].map((status) => (
              <button
                key={status}
                aria-pressed={statusFilter === status}
                onClick={() => updateFilters({ status })}
              >
                {status
                  ? t(`unified.${status}`)
                  : t('properties.inventory.all')}
              </button>
            ))}
          </div>
          <div className="inventory-toolbar">
            <label className="inventory-search">
              <MarketplaceIcon name="search" />
              <span className="sr-only">
                {t('properties.inventory.search')}
              </span>
              <input
                type="search"
                placeholder={t('properties.inventory.search')}
                value={query}
                onChange={(event) =>
                  updateFilters({ q: event.target.value }, true)
                }
              />
            </label>
            <label className="inventory-type">
              <span className="sr-only">{t('properties.fields.type')}</span>
              <select
                value={typeFilter}
                onChange={(event) =>
                  updateFilters({ type: event.target.value })
                }
              >
                <option value="">{t('properties.inventory.allTypes')}</option>
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`properties.types.${type}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="inventory-refresh"
              aria-label={t('controls.refresh')}
              title={t('controls.refresh')}
              disabled={properties.isFetching}
              onClick={refresh}
            >
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </>
      )}
      {workspace.state === 'LOADING' ? (
        <InventorySkeleton />
      ) : blockedByLifecycle ? (
        <p className="inventory-state">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      ) : !canRead ? (
        <p role="alert" className="inventory-state">
          {t('permissionDenied')}
        </p>
      ) : properties.isLoading ? (
        <InventorySkeleton />
      ) : properties.isError ? (
        <div className="inventory-state" role="alert">
          <p>
            {properties.error instanceof ApiError &&
            properties.error.status === 403
              ? t('permissionDenied')
              : t('properties.loadFailed')}
          </p>
          <button
            className="provider-button provider-button-secondary"
            onClick={refresh}
          >
            {t('properties.inventory.retry')}
          </button>
        </div>
      ) : (
        <>
          <p className="inventory-count" role="status">
            {t('properties.inventory.count', { count: filtered.length })}
          </p>
          {listings.isError &&
            workspace.hasProviderPermission('listing:read') && (
              <div role="alert" className="inventory-eligibility-error">
                <p>{t('unified.visibilityError')}</p>
                <button onClick={() => void listings.refetch()}>
                  {t('properties.inventory.retry')}
                </button>
              </div>
            )}
          {filtered.length === 0 ? (
            <div className="inventory-state">
              <MarketplaceIcon name="building" />
              <h2>
                {t(
                  hasFilters
                    ? 'controls.noResults'
                    : 'properties.inventory.emptyTitle',
                )}
              </h2>
              <p>
                {t(
                  hasFilters
                    ? 'properties.inventory.tryFilters'
                    : 'properties.empty',
                )}
              </p>
              {hasFilters ? (
                <button
                  className="provider-button provider-button-secondary"
                  onClick={() => updateFilters({ q: '', status: '', type: '' })}
                >
                  {t('properties.inventory.clear')}
                </button>
              ) : (
                createLink
              )}
            </div>
          ) : (
            <>
              <ul className="inventory-list">
                {visible.map((estate) => (
                  <PropertyCard
                    key={estate.id}
                    estate={estate}
                    visibility={
                      visibilityReady
                        ? publicListings(estate, listings.data ?? []).length > 0
                          ? 'public'
                          : 'private'
                        : 'unknown'
                    }
                    canUpdate={canUpdate}
                    canArchive={canArchive}
                    pending={pendingActionFor(estate.id)}
                    onAction={(action, selected) => {
                      if (action === 'archive') {
                        setLifecycleError(null);
                        setArchiveTarget(selected);
                      } else runLifecycle(action, selected.id);
                    }}
                  />
                ))}
              </ul>
              <div className="inventory-footer">
                <p>
                  {t('properties.inventory.showing', {
                    from: (page - 1) * PAGE_SIZE + 1,
                    to: Math.min(page * PAGE_SIZE, filtered.length),
                    total: filtered.length,
                  })}
                </p>
                {pageCount > 1 && (
                  <nav aria-label={t('properties.inventory.pagination')}>
                    <button
                      disabled={page === 1}
                      onClick={() => updateFilters({ page: String(page - 1) })}
                    >
                      {t('properties.inventory.previous')}
                    </button>
                    <span>
                      {page} / {pageCount}
                    </span>
                    <button
                      disabled={page === pageCount}
                      onClick={() => updateFilters({ page: String(page + 1) })}
                    >
                      {t('properties.inventory.next')}
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </>
      )}
      {lifecycleError != null && !archiveTarget && (
        <p role="alert" className="inventory-error">
          {lifecycleErrorMessage}
        </p>
      )}
      <Modal
        isOpen={archiveTarget !== null}
        onClose={() => {
          if (!archiveProperty.isPending) setArchiveTarget(null);
        }}
        title={t('properties.inventory.archiveTitle')}
        footer={
          <>
            <button
              className="provider-button provider-button-secondary"
              disabled={archiveProperty.isPending}
              onClick={() => setArchiveTarget(null)}
            >
              {t('properties.cancel')}
            </button>
            <button
              className="provider-button provider-button-primary"
              disabled={archiveProperty.isPending || !canArchive}
              onClick={() => {
                if (archiveTarget && canArchive)
                  runLifecycle('archive', archiveTarget.id);
              }}
            >
              {t(
                archiveProperty.isPending
                  ? 'properties.archiving'
                  : 'properties.archive',
              )}
            </button>
          </>
        }
      >
        <p className="break-words">
          {t('properties.inventory.archiveConfirm', {
            title: archiveTarget?.title ?? '',
          })}
        </p>
        {lifecycleError != null && (
          <p role="alert" className="mt-3 text-[var(--danger)]">
            {lifecycleErrorMessage}
          </p>
        )}
      </Modal>
    </section>
  );
}
