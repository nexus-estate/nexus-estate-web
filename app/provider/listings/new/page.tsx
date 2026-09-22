'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useCreateProviderListing,
  useListingEligibleProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import { FEEDBACK, notify } from '@/lib/notify';

const CONTROL_CLASS = 'field';

/**
 * Creates a DRAFT Listing from a provider-owned Property. Publishing is an
 * explicit lifecycle command elsewhere; this flow never auto-publishes.
 */
export default function NewProviderListingPage() {
  const router = useRouter();
  const t = useTranslations('provider');
  const commonT = useTranslations('common');
  const workspace = useProviderAuthorization();
  const canCreate = workspace.hasProviderPermission('listing:create');
  const eligibleProperties = useListingEligibleProperties(canCreate);
  const createListing = useCreateProviderListing();
  const [estateId, setEstateId] = useState('');

  const canSubmit = canCreate && !createListing.isPending;
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';
  const dependenciesReady =
    workspace.state === 'ACTIVE_VERIFIED' &&
    canCreate &&
    !eligibleProperties.isLoading &&
    !eligibleProperties.isError;
  const eligiblePermissionDenied =
    eligibleProperties.error instanceof ApiError &&
    eligibleProperties.error.status === 403;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !estateId) return;
    try {
      await createListing.mutateAsync({ estateId });
      router.push('/provider/listings');
      notify.success(commonT(FEEDBACK.created));
    } catch (error) {
      notify.apiError(error, commonT, 'listings.createFailed');
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
        <p className="panel mb-4 px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' && !canCreate && (
        <p className="panel mb-4 px-4 py-3 text-sm text-[var(--text-muted)]">
          {t('permissionDenied')}
        </p>
      )}
      {workspace.state === 'ACTIVE_VERIFIED' &&
        canCreate &&
        eligibleProperties.isLoading && (
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            {t('loading')}
          </p>
        )}
      {workspace.state === 'ACTIVE_VERIFIED' &&
        canCreate &&
        !eligibleProperties.isLoading &&
        eligibleProperties.isError && (
          <p
            role="alert"
            className="mb-4 rounded-[var(--radius-md)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
          >
            {t(
              eligiblePermissionDenied
                ? 'permissionDenied'
                : 'listings.loadFailed',
            )}
          </p>
        )}
      {dependenciesReady && eligibleProperties.data?.length === 0 && (
        <p className="panel mb-4 px-4 py-3 text-sm text-[var(--text-muted)]">
          {t('listings.noEligibleProperties')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {createListing.isError && (
          <p
            role="alert"
            className="rounded-[var(--radius-md)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
          >
            {createListing.error instanceof ApiError &&
            createListing.error.status === 403
              ? t('permissionDenied')
              : t('listings.createFailed')}
          </p>
        )}

        <div className="panel space-y-4 p-5 sm:p-6">
          <div>
            <label className="field-label" htmlFor="listing-estate">
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
              {(eligibleProperties.data ?? []).map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {t('listings.draftNote')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || !estateId || !dependenciesReady}
            className="btn btn-primary btn-lg"
          >
            {createListing.isPending
              ? t('listings.submitting')
              : t('listings.createDraft')}
          </button>
          <Link href="/provider/listings" className="btn btn-secondary btn-lg">
            {t('listings.cancel')}
          </Link>
        </div>
      </form>
    </>
  );
}
