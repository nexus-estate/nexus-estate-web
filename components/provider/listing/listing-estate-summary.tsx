'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { EstateGallery } from '@/components/shared/estate-gallery';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderEstateMedia } from '@/features/provider/supply/provider-supply.queries';
import type { Estate } from '@/lib/api/estate/estate.types';

export function ListingEstateSummary({ estate }: { estate: Estate }) {
  const t = useTranslations('provider');
  const locale = useLocale();
  const workspace = useProviderAuthorization();
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const media = useProviderEstateMedia(
    estate.id,
    canRead && estate.status === 'ACTIVE',
  );
  const facts = [
    ...(estate.area !== null
      ? [{ label: t('properties.fields.area'), value: `${estate.area} m²` }]
      : []),
    ...(estate.bedrooms !== null
      ? [{ label: t('properties.fields.bedrooms'), value: estate.bedrooms }]
      : []),
    ...(estate.bathrooms !== null
      ? [{ label: t('properties.fields.bathrooms'), value: estate.bathrooms }]
      : []),
    {
      label: t('properties.fields.type'),
      value: t(`properties.types.${estate.type}`),
    },
    ...(estate.floors !== null
      ? [{ label: t('listingDetail.floors'), value: estate.floors }]
      : []),
  ];
  return (
    <section aria-labelledby="listing-estate-title" className="mt-7 space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
            {t('listingDetail.linkedEstate')}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            {canUpdate && (
              <Link
                className="font-medium text-[var(--primary)] underline underline-offset-4"
                href={`/provider/properties/${estate.id}/edit`}
              >
                {t('listingDetail.editEstate')}
              </Link>
            )}
            {canUpdate && estate.status !== 'ARCHIVED' && (
              <Link
                className="font-medium text-[var(--primary)] underline underline-offset-4"
                href={`/provider/media?estateId=${encodeURIComponent(estate.id)}`}
              >
                {t('listingDetail.manageMedia')}
              </Link>
            )}
          </div>
        </div>
        <h2
          id="listing-estate-title"
          className="mt-3 break-words text-2xl font-semibold tracking-tight text-[var(--brand-strong)] sm:text-3xl"
        >
          {estate.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          {[estate.addressLine, estate.ward.name, estate.province.name]
            .filter(Boolean)
            .join(', ')}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <p className="text-2xl font-semibold text-[var(--brand)]">
            {new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(estate.price)}
          </p>
          <StatusBadge
            status={estate.status}
            label={t(`properties.status.${estate.status}`)}
          />
          <span className="text-sm text-[var(--text-muted)]">
            {t(`properties.purposes.${estate.purpose}`)}
          </span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-5 border-y border-[var(--border-muted)] py-5 sm:grid-cols-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="min-w-0 border-l border-[var(--border-muted)] pl-4"
          >
            <dt className="text-xs text-[var(--text-muted)]">{fact.label}</dt>
            <dd className="mt-1 break-words text-base font-semibold">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          {t('listingDetail.gallery')}
        </h3>
        {estate.status === 'ACTIVE' ? (
          <EstateGallery
            key={estate.id}
            estateId={estate.id}
            title={estate.title}
            media={media.data}
            loading={media.isLoading}
            error={media.isError}
            onRetry={() => void media.refetch()}
          />
        ) : (
          <p
            role="status"
            className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-6 text-[var(--text-muted)]"
          >
            {t('listingDetail.privateMediaUnavailable')}
          </p>
        )}
      </div>
      {estate.description?.trim() && (
        <section className="border-t border-[var(--border-muted)] pt-6">
          <h3 className="text-lg font-semibold">
            {t('properties.fields.description')}
          </h3>
          <p className="mt-3 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-[var(--text-muted)]">
            {estate.description}
          </p>
        </section>
      )}
    </section>
  );
}
