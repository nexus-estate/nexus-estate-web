'use client';

import { useTranslations } from 'next-intl';
import type { ListingEstate } from '@/lib/api/listing/listing.types';

export function PropertySummary({ property }: { property: ListingEstate }) {
  const customerT = useTranslations('customer');
  return (
    <header className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--brand)]">
        {customerT(`home.propertyTypes.${property.type.toLowerCase()}`)}
      </p>
      <h1 className="mt-3 break-words text-[30px] font-semibold leading-[1.2] tracking-[-.035em] text-[var(--brand-strong)] sm:text-4xl">
        {property.title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
        {[property.addressLine, property.ward.name, property.province.name]
          .filter(Boolean)
          .join(', ')}
      </p>
    </header>
  );
}

export function PropertyInformation({ property }: { property: ListingEstate }) {
  const t = useTranslations('customer.propertyDetail');
  const purpose =
    property.purpose === 'SALE'
      ? t('forSale')
      : property.purpose === 'RENT'
        ? t('forRent')
        : t('forSaleOrRent');
  const facts = [
    {
      value: property.area === null ? '—' : `${property.area} m²`,
      label: t('areaLabel'),
    },
    { value: property.bedrooms ?? '—', label: t('bedrooms') },
    { value: property.bathrooms ?? '—', label: t('bathrooms') },
    { value: purpose, label: t('purposeLabel') },
  ];
  return (
    <div className="min-w-0 space-y-9 lg:space-y-10">
      <dl className="grid grid-cols-2 gap-y-6 border-y border-[var(--border)] py-6 sm:grid-cols-4">
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={`flex min-w-0 flex-col px-4 first:pl-0 sm:px-5 ${index === 2 ? 'pl-0 sm:pl-5' : ''} ${index % 2 === 0 ? 'border-r border-[var(--border)]' : ''} ${index < 3 ? 'sm:border-r sm:border-[var(--border)]' : ''}`}
          >
            <dt className="order-last mt-1 text-xs text-[var(--text-muted)]">
              {fact.label}
            </dt>
            <dd
              className={`font-semibold leading-7 text-[var(--brand-strong)] ${index === 3 ? 'text-base' : 'text-2xl'}`}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      {property.description?.trim() && (
        <section aria-labelledby="property-description-title">
          <h2
            id="property-description-title"
            className="text-xl font-semibold tracking-tight text-[var(--brand-strong)]"
          >
            {t('descriptionTitle')}
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line break-words text-[15px] leading-7 text-[var(--text-muted)]">
            {property.description}
          </p>
        </section>
      )}
      {property.floors !== null && (
        <section
          aria-labelledby="property-additional-title"
          className="border-t border-[var(--border)] pt-8"
        >
          <h2
            id="property-additional-title"
            className="text-xl font-semibold tracking-tight text-[var(--brand-strong)]"
          >
            {t('additionalTitle')}
          </h2>
          <dl className="mt-4 flex max-w-sm items-center justify-between gap-4 text-sm">
            <dt className="text-[var(--text-muted)]">{t('floors')}</dt>
            <dd className="font-semibold text-[var(--text)]">
              {property.floors}
            </dd>
          </dl>
        </section>
      )}
    </div>
  );
}
