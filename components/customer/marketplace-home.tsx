'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/lib/api/listing/listing.types';
import { getProviderHref } from '@/lib/platform/urls';
import { PropertyCard } from './property-card';

const types = ['apartment', 'house', 'villa', 'land', 'office'] as const;
const cities = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Da Lat', 'Binh Duong'];

export function MarketplaceHome({
  featured,
  properties,
}: {
  featured: Listing[];
  properties: Listing[];
}) {
  const t = useTranslations('customer');
  return (
    <div className="bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="animate-fade-up">
              <p className="label-caps">{t('home.eyebrow')}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
                {t('home.title')}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                {t('home.description')}
              </p>

              <form
                action="/properties"
                method="GET"
                className="panel mt-6 grid gap-3 p-3 sm:grid-cols-[1.6fr_1fr_auto] sm:items-end"
              >
                <div>
                  <label htmlFor="home-query" className="field-label">
                    {t('home.location')}
                  </label>
                  <input
                    id="home-query"
                    name="q"
                    type="search"
                    placeholder={t('home.searchPlaceholder')}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="home-type" className="field-label">
                    {t('home.searchType')}
                  </label>
                  <select id="home-type" name="type" className="field">
                    <option value="">{t('home.allTypes')}</option>
                    {types.map((type) => (
                      <option key={type} value={type.toUpperCase()}>
                        {t(`home.propertyTypes.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m16 16 5 5" strokeLinecap="round" />
                  </svg>
                  {t('home.search')}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--text-subtle)]">
                  {t('home.quickSearch')}
                </span>
                {cities.map((city) => (
                  <Link
                    key={city}
                    href={`/properties?q=${encodeURIComponent(city)}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] lg:block">
              <Image
                src="/images/hero-villa.webp"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="mx-auto max-w-[var(--content-max)] scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {t('home.featured')}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('home.featuredDescription')}
            </p>
          </div>
          <Link href="/properties" className="link text-sm whitespace-nowrap">
            {t('home.viewAll')} →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length ? (
            featured.map((property) => (
              <PropertyCard key={property.id} listing={property} />
            ))
          ) : (
            <div className="panel-muted col-span-full flex flex-col items-center px-6 py-12 text-center">
              <span
                className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-subtle)]"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M4 20V9.5L12 4l8 5.5V20M9 20v-6h6v6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                {t('home.empty')}
              </p>
              <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
                {t('home.emptyDescription')}
              </p>
              <Link href="/properties" className="btn btn-secondary mt-4">
                {t('home.viewAll')}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                {t('home.spacesTitle')}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
                {t('home.titleAccent')}
              </p>
            </div>
            <p className="label-caps">{t('home.discover')}</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['villa', '/images/properties/villa-dalat.webp'],
              ['apartment', '/images/properties/residence-danang.webp'],
              ['house', '/images/properties/penthouse-saigon.webp'],
            ].map(([type, image]) => (
              <Link
                key={type}
                href={`/properties?type=${type.toUpperCase()}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_23_32_/_0.72),rgb(15_23_32_/_0.05)_60%)]"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white">
                  <span className="text-base font-semibold">
                    {t(`home.propertyTypes.${type}`)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-sm transition-colors group-hover:bg-white group-hover:text-[var(--text)]"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--content-max)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {t('home.latest')}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('home.latestDescription')}
            </p>
          </div>
          <Link href="/properties" className="link text-sm whitespace-nowrap">
            {t('home.viewAll')} →
          </Link>
        </div>
        {properties.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} listing={property} />
            ))}
          </div>
        ) : (
          <div className="panel-muted mt-5 px-6 py-12 text-center text-sm text-[var(--text-muted)]">
            {t('home.empty')}
          </div>
        )}
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              {t('home.whyNexus')}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('home.whyDescription')}
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['recommendation', '01'],
              ['smartSearch', '02'],
              ['trusted', '03'],
            ].map(([key, number]) => (
              <article key={key} className="panel p-5">
                <p className="grid h-7 w-7 place-items-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">
                  {number}
                </p>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">
                  {t(`home.${key}`)}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[var(--text-muted)]">
                  {t(`home.${key}Description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--content-max)] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {t('home.providerCta')}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              {t('home.providerCtaDescription')}
            </p>
          </div>
          <a
            href={getProviderHref('/provider/onboarding')}
            className="btn btn-primary btn-lg shrink-0"
          >
            {t('home.providerCtaAction')}
          </a>
        </div>
      </section>
    </div>
  );
}
