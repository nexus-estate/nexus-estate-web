'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { PropertyDetailLayout } from '@/components/customer/property-detail/property-detail-layout';
import { estateApi } from '@/lib/api/estate/estate.api';

export default function EstateDetailPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations('customer');
  const estate = useQuery({
    queryKey: ['marketplace', 'estate', params.id],
    queryFn: () => estateApi.getById(params.id),
    enabled: Boolean(params.id),
  });
  const property = estate.data;

  if (estate.isLoading) {
    return (
      <div
        role="status"
        className="mx-auto max-w-6xl px-5 py-16 text-sm text-[var(--text-muted)]"
      >
        {t('home.loading')}
      </div>
    );
  }
  if (!property) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-2xl font-semibold">
          {t('propertyDetail.notFound')}
        </h1>
        <Link
          className="mt-5 inline-block text-sm font-semibold text-[var(--brand)] underline"
          href="/properties"
        >
          {t('propertyDetail.back')}
        </Link>
      </div>
    );
  }

  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(property.price);

  return <PropertyDetailLayout property={property} price={price} />;
}
