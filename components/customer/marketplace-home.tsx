'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Listing } from '@/lib/api/listing/listing.types';
import { getProviderUrl } from '@/lib/platform/urls';
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
      <section className="relative overflow-hidden bg-[var(--brand-strong)] text-[var(--text-on-dark)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(179,138,70,.28),transparent_38%),linear-gradient(135deg,rgba(18,59,58,.95),rgba(7,27,27,.98))]" />
        <div className="relative mx-auto grid max-w-[var(--content-max)] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow text-[var(--brand-accent)]">
              {t('home.eyebrow')}
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[.98] tracking-[-.035em] sm:text-6xl lg:text-7xl">
              {t('home.title')}
              <span className="mt-3 block text-[var(--brand-accent)]">
                {t('home.titleAccent')}
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {t('home.description')}
            </p>
          </div>
          <form
            action="/properties"
            method="GET"
            className="rounded-[var(--radius-xl)] border border-white/15 bg-white/[.09] p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:p-4"
          >
            <div className="grid gap-3">
              <label
                className="text-xs font-semibold text-white/70"
                htmlFor="home-query"
              >
                {t('home.searchPlaceholder')}
              </label>
              <input
                id="home-query"
                name="q"
                type="search"
                placeholder={t('home.searchPlaceholder')}
                className="min-h-12 rounded-[var(--radius-md)] border-0 bg-white px-4 text-sm text-[var(--text)] shadow-[var(--shadow-xs)] outline-none placeholder:text-[var(--text-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
              />
              <label
                className="text-xs font-semibold text-white/70"
                htmlFor="home-type"
              >
                {t('home.searchType')}
              </label>
              <select
                id="home-type"
                name="type"
                className="min-h-12 rounded-[var(--radius-md)] border-0 bg-white px-4 text-sm text-[var(--text)] shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
              >
                <option value="">{t('home.allTypes')}</option>
                {types.map((type) => (
                  <option key={type} value={type.toUpperCase()}>
                    {t(`home.propertyTypes.${type}`)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="mt-1 min-h-12 rounded-[var(--radius-md)] bg-[var(--brand-accent)] px-5 text-sm font-semibold text-[var(--brand-strong)] transition-colors hover:bg-[#c4a15f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-strong)]"
              >
                {t('home.search')}
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="border-b border-[var(--border-muted)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-5 py-6 sm:px-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--text-subtle)]">
            {t('home.quickSearch')}
          </p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/properties?q=${encodeURIComponent(city)}`}
                className="shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand)]"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[var(--content-max)] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t('home.featured')}</p>
            <h2 className="mt-3 font-display text-4xl tracking-[-.02em] text-[var(--brand-strong)]">
              {t('home.featured')}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {t('home.featuredDescription')}
            </p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand-accent)] underline-offset-4"
          >
            {t('home.viewAll')} →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((property) => (
            <PropertyCard key={property.id} listing={property} />
          ))}
        </div>
      </section>
      <section className="border-y border-[var(--border-muted)] bg-[var(--surface-subtle)]">
        <div className="mx-auto max-w-[var(--content-max)] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <p className="eyebrow">{t('home.latest')}</p>
          <h2 className="mt-3 font-display text-4xl tracking-[-.02em] text-[var(--brand-strong)]">
            {t('home.latest')}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t('home.latestDescription')}
          </p>
          {properties.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} listing={property} />
              ))}
            </div>
          ) : (
            <div className="app-panel-muted mt-8 px-6 py-14 text-center text-sm text-[var(--text-muted)]">
              {t('home.empty')}
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-[var(--content-max)] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('home.whyNexus')}</p>
          <h2 className="mt-3 font-display text-4xl tracking-[-.02em] text-[var(--brand-strong)]">
            {t('home.whyNexus')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {t('home.whyDescription')}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['recommendation', '01'],
            ['smartSearch', '02'],
            ['trusted', '03'],
          ].map(([key, number]) => (
            <article
              key={key}
              className="border-t-2 border-[var(--brand-accent)] pt-5"
            >
              <p className="text-xs font-semibold text-[var(--brand-accent)]">
                {number}
              </p>
              <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">
                {t(`home.${key}`)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {t(`home.${key}Description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[var(--brand)] text-white">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <h2 className="font-display text-3xl">{t('home.providerCta')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              {t('home.providerCtaDescription')}
            </p>
          </div>
          <a
            href={getProviderUrl('/provider/onboarding')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-accent)] px-5 text-sm font-semibold text-[var(--brand-strong)] hover:bg-[#c4a15f]"
          >
            {t('home.providerCtaAction')}
          </a>
        </div>
      </section>
    </div>
  );
}
