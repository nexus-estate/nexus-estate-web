'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  useProviderListings,
  useProviderProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { useProviderEntryState } from '@/features/provider/use-provider-entry-state';

function Arrow() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProviderPage() {
  const t = useTranslations('provider');
  const locale = useLocale();
  const workspace = useProviderEntryState();
  const account = workspace.account.data;
  const auth = workspace.authorization.data;
  const isActive = workspace.state === 'ACTIVE';
  const permissions =
    auth?.permissions.map((permission) => permission.code) ?? [];
  const canReadProperties = isActive && permissions.includes('property:read');
  const canReadListings = isActive && permissions.includes('listing:read');
  const canCreateProperty = isActive && permissions.includes('property:create');
  const canCreateListing = isActive && permissions.includes('listing:create');
  const properties = useProviderProperties(canReadProperties);
  const listings = useProviderListings(canReadListings);

  if (workspace.state === 'LOADING') {
    return (
      <div
        className="provider-card p-8 text-sm text-[var(--text-muted)]"
        role="status"
      >
        {t('loading')}
      </div>
    );
  }

  if (workspace.state === 'NO_PROVIDER') {
    return (
      <div className="provider-welcome">
        <span className="provider-eyebrow">{t('overview.workspace')}</span>
        <h1>{t('overview.noProviderTitle')}</h1>
        <p>{t('overview.noProviderBody')}</p>
        <Link
          className="provider-button provider-button-primary mt-7"
          href="/provider/onboarding"
        >
          {t('onboarding.start')} <Arrow />
        </Link>
      </div>
    );
  }

  const lifecycleKey =
    workspace.state === 'PENDING'
      ? 'pending_verification'
      : workspace.state === 'ACTIVE'
        ? 'active_verified'
        : workspace.state.toLowerCase();
  const stateText = t(`lifecycle.${lifecycleKey}`);
  const propertyCount =
    properties.isError || !canReadProperties
      ? '—'
      : properties.isLoading
        ? '…'
        : (properties.data?.length ?? 0);
  const listingCount =
    listings.isError || !canReadListings
      ? '—'
      : listings.isLoading
        ? '…'
        : (listings.data?.length ?? 0);
  const publishedCount =
    listings.isError || !canReadListings
      ? '—'
      : listings.isLoading
        ? '…'
        : (listings.data?.filter((listing) => listing.status === 'PUBLISHED')
            .length ?? 0);
  const drafts =
    properties.data?.filter((property) => property.status === 'DRAFT').length ??
    0;
  const recentProperties = [...(properties.data ?? [])]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <div className="space-y-7 pb-8">
      <section className="provider-hero">
        <div className="relative z-10 max-w-2xl">
          <span className="provider-eyebrow text-[#b9e9df]">
            {t('overview.workspace')}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {account?.displayName ?? t('overview.title')}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
            {t('overview.description')}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {canCreateProperty && (
              <Link
                className="provider-button provider-button-light"
                href="/provider/properties/new"
              >
                {t('properties.new')} <Arrow />
              </Link>
            )}
            {canCreateListing && (
              <Link
                className="provider-button provider-button-outline"
                href="/provider/listings/new"
              >
                {t('listings.new')} <Arrow />
              </Link>
            )}
            {!isActive && (
              <Link
                className="provider-button provider-button-light"
                href="/provider/account"
              >
                {t('nav.account')} <Arrow />
              </Link>
            )}
          </div>
        </div>
        <div className="provider-hero-mark" aria-hidden="true">
          N
        </div>
      </section>

      <section
        className="provider-status-strip"
        aria-label={t('overview.platformState')}
      >
        <div className="flex items-start gap-3">
          <span
            className={`provider-status-dot ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--text-subtle)]">
              {t('overview.platformState')}
            </p>
            <p className="mt-1 font-semibold text-[var(--text)]">{stateText}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {account?.status && (
            <span className="provider-chip">
              {t(`status.${account.status.toLowerCase()}`)}
            </span>
          )}
          {account?.type && (
            <span className="provider-chip">{t(`types.${account.type}`)}</span>
          )}
          {account?.verificationStatus && (
            <span className="provider-chip">
              {t(`status.${account.verificationStatus.toLowerCase()}`)}
            </span>
          )}
          {auth?.roles.map((role) => (
            <span key={role.code} className="provider-chip">
              {role.name}
            </span>
          ))}
          {workspace.state === 'ERROR' && (
            <button
              className="provider-text-link"
              type="button"
              onClick={() => {
                void workspace.account.refetch();
                void workspace.authorization.refetch();
              }}
            >
              {t('overview.retry')} <Arrow />
            </button>
          )}
        </div>
      </section>

      {isActive && (
        <>
          <section
            aria-label={t('overview.inventory')}
            className="grid gap-4 sm:grid-cols-3"
          >
            <Link
              className="provider-stat provider-card"
              href="/provider/properties"
            >
              <span className="provider-stat-label">{t('nav.properties')}</span>
              <span className="provider-stat-value">{propertyCount}</span>
              <span className="provider-stat-note">
                {canReadProperties && properties.isSuccess
                  ? t('overview.propertyDrafts', { count: drafts })
                  : t('overview.viewAll')}{' '}
                <Arrow />
              </span>
            </Link>
            <Link
              className="provider-stat provider-card"
              href="/provider/listings"
            >
              <span className="provider-stat-label">{t('nav.listings')}</span>
              <span className="provider-stat-value">{listingCount}</span>
              <span className="provider-stat-note">
                {t('overview.manageListings')} <Arrow />
              </span>
            </Link>
            <Link
              className="provider-stat provider-card"
              href="/provider/listings"
            >
              <span className="provider-stat-label">
                {t('overview.published')}
              </span>
              <span className="provider-stat-value">{publishedCount}</span>
              <span className="provider-stat-note">
                {t('overview.viewPublished')} <Arrow />
              </span>
            </Link>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
            <section className="provider-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-muted)] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text)]">
                    {t('overview.recentProperties')}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('overview.recentDescription')}
                  </p>
                </div>
                <Link
                  className="provider-text-link"
                  href="/provider/properties"
                >
                  {t('overview.viewAll')} <Arrow />
                </Link>
              </div>
              {properties.isLoading ? (
                <p className="p-6 text-sm text-[var(--text-muted)]">
                  {t('loading')}
                </p>
              ) : properties.isError ? (
                <p role="alert" className="p-6 text-sm text-[var(--danger)]">
                  {t('properties.loadFailed')}
                </p>
              ) : recentProperties.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    {canReadProperties
                      ? t('properties.empty')
                      : t('permissionDenied')}
                  </p>
                  {canCreateProperty && (
                    <Link
                      className="provider-button provider-button-primary mt-5"
                      href="/provider/properties/new"
                    >
                      {t('properties.new')} <Arrow />
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-muted)]">
                  {recentProperties.map((property) => (
                    <li
                      key={property.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--text)]">
                          {property.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {property.province.name} ·{' '}
                          {new Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0,
                          }).format(property.price)}
                        </p>
                      </div>
                      <span
                        className={`provider-property-status ${property.status === 'ACTIVE' ? 'provider-property-status-active' : ''}`}
                      >
                        {t(`properties.status.${property.status}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="provider-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">
                {t('overview.quickActions')}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t('overview.quickActionsDescription')}
              </p>
              <div className="mt-5 space-y-2">
                <Link className="provider-action" href="/provider/properties">
                  <span>{t('nav.properties')}</span>
                  <Arrow />
                </Link>
                <Link className="provider-action" href="/provider/listings">
                  <span>{t('nav.listings')}</span>
                  <Arrow />
                </Link>
                <Link className="provider-action" href="/provider/media">
                  <span>{t('nav.media')}</span>
                  <Arrow />
                </Link>
                <Link className="provider-action" href="/provider/account">
                  <span>{t('nav.account')}</span>
                  <Arrow />
                </Link>
                <Link
                  className="provider-action"
                  href="/provider/authorization"
                >
                  <span>{t('nav.authorization')}</span>
                  <Arrow />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}

      {!isActive && (
        <section className="provider-card p-6">
          <h2 className="text-lg font-semibold">{t('overview.nextStep')}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {stateText}
          </p>
          <Link className="provider-text-link mt-5" href="/provider/account">
            {t('nav.account')} <Arrow />
          </Link>
        </section>
      )}
    </div>
  );
}
