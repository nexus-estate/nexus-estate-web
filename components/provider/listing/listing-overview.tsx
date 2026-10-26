'use client';

import { useLocale, useTranslations } from 'next-intl';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Listing } from '@/lib/api/listing/listing.types';
import { ListingActions } from './listing-actions';

export function ListingOverview({ listing }: { listing: Listing }) {
  const t = useTranslations('provider');
  const locale = useLocale();
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  const rows = [
    { label: t('listingDetail.listingId'), value: listing.id },
    { label: t('listingDetail.estateId'), value: listing.estateId },
    { label: t('listingDetail.createdAt'), value: date(listing.createdAt) },
    { label: t('listingDetail.updatedAt'), value: date(listing.updatedAt) },
    ...(listing.publishedAt
      ? [
          {
            label: t('listingDetail.publishedAt'),
            value: date(listing.publishedAt),
          },
        ]
      : []),
  ];
  return (
    <section
      aria-labelledby="listing-overview-title"
      className="border-b border-[var(--border)] pb-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="listing-overview-title" className="text-lg font-semibold">
            {t('listingDetail.overview')}
          </h2>
          <div className="mt-3">
            <StatusBadge
              status={listing.status}
              label={t(`listings.status.${listing.status}`)}
            />
          </div>
        </div>
        <ListingActions listing={listing} />
      </div>
      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-xs text-[var(--text-muted)]">{row.label}</dt>
            <dd className="mt-1 break-all text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
