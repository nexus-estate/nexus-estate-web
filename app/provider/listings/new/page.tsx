'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useCreateProviderListing,
  useProviderListings,
  useProviderProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { getListingEligibleProperties } from '@/features/provider/supply/provider-supply.selectors';
import { ApiError } from '@/lib/api/core/error';

const CONTROL_CLASS =
  'mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]';

/**
 * Creates a DRAFT Listing from a provider-owned Property. Publishing is an
 * explicit lifecycle command elsewhere; this flow never auto-publishes.
 * Only Properties without a Listing yet are selectable — the API allows one
 * non-deleted Listing per Estate.
 */
export default function NewProviderListingPage() {
  const router = useRouter();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const properties = useProviderProperties(
    workspace.hasProviderPermission('property:read'),
  );
  const listings = useProviderListings(
    workspace.hasProviderPermission('listing:read'),
  );
  const createListing = useCreateProviderListing();
  const [estateId, setEstateId] = useState('');

  const canSubmit =
    workspace.hasProviderPermission('listing:create') &&
    !createListing.isPending;
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const dependenciesReady =
    workspace.state === 'ACTIVE_VERIFIED' &&
    workspace.hasProviderPermission('property:read') &&
    !properties.isLoading &&
    !properties.isError;
  const dependenciesLoading = properties.isLoading;

  const eligibleProperties = useMemo(
    () =>
      getListingEligibleProperties(properties.data ?? [], listings.data ?? []),
    [properties.data, listings.data],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !estateId) return;
    try {
      await createListing.mutateAsync({ estateId });
      router.push('/provider/listings');
    } catch {
      // Error surfaces through the mutation state below.
    }
  };

  return (
    <>
      <PageHeader
        title={t('listings.newTitle')}
        description={t('listings.newDescription')}
      />
      {workspace.state === 'LOADING' && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t('loading')}</p>
      )}
      {blockedByLifecycle && (
        <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' &&
        !workspace.hasProviderPermission('property:read') && (
          <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
            {t('permissionDenied')}
          </p>
        )}
      {workspace.state === 'ACTIVE_VERIFIED' && dependenciesLoading && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t('loading')}</p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' &&
        !dependenciesLoading &&
        properties.isError && (
          <p
            role="alert"
            className="mb-4 border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {t('listings.loadFailed')}
          </p>
        )}
      {dependenciesReady && eligibleProperties.length === 0 && (
        <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {(properties.data ?? []).length === 0
            ? t('listings.noProperties')
            : t('listings.noEligibleProperties')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {createListing.isError && (
          <p
            role="alert"
            className="border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {createListing.error instanceof ApiError &&
            createListing.error.status === 403
              ? t('permissionDenied')
              : t('listings.createFailed')}
          </p>
        )}

        <div className="space-y-4 border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="listing-estate"
            >
              {t('listings.fields.property')}
            </label>
            <select
              id="listing-estate"
              required
              value={estateId}
              onChange={(event) => setEstateId(event.target.value)}
              disabled={!dependenciesReady}
              className={CONTROL_CLASS}
            >
              <option value="">
                {t('listings.fields.propertyPlaceholder')}
              </option>
              {eligibleProperties.map((estate) => (
                <option key={estate.id} value={estate.id}>
                  {estate.title}
                </option>
              ))}
            </select>
            {dependenciesReady &&
              (properties.data ?? []).length > 0 &&
              eligibleProperties.length === 0 && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {t('listings.noEligibleProperties')}
                </p>
              )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {t('listings.draftNote')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || !estateId || !dependenciesReady}
            className="bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {createListing.isPending
              ? t('listings.submitting')
              : t('listings.createDraft')}
          </button>
          <Link
            href="/provider/listings"
            className="border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            {t('listings.cancel')}
          </Link>
        </div>
      </form>
    </>
  );
}
