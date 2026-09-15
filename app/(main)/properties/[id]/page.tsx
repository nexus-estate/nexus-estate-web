'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PropertyCard } from '@/components/customer/property-card';
import { leadApi } from '@/lib/api/lead/lead.api';
import { propertyApi } from '@/lib/api/property/property.api';
import type { Property } from '@/lib/api/property/property.types';
import { searchApi } from '@/lib/api/search/search.api';

export default function PropertyDetailPage() {
  const locale = useLocale();
  const t = useTranslations('customer.propertyDetail');
  const customerT = useTranslations('customer');
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const [propData, simData] = await Promise.all([
          propertyApi.getById(params.id as string),
          searchApi.similarProperties(params.id as string, 3).catch(() => []),
        ]);
        setProperty(propData);
        setSimilar(Array.isArray(simData) ? simData : []);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError(false);
    try {
      await leadApi.create({
        listingId: params.id as string,
        name: leadForm.name,
        phone: leadForm.phone,
        message: leadForm.message,
      });
      setLeadSent(true);
    } catch {
      setLeadError(true);
    } finally {
      setLeadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="skeleton h-96 rounded-xl" />
          <div className="mt-6 space-y-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">{t('notFound')}</p>
          <Link
            href="/properties"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    );
  }

  const p = property;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            {t('home')}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/properties" className="hover:text-blue-600">
            {t('properties')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{p.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="flex h-72 sm:h-96 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
              <div className="text-center">
                <span className="text-8xl opacity-40">
                  <span
                    className="h-24 w-24 rounded-full border border-white/30 bg-white/10"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </div>

            {/* Property info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {p.price
                  ? new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(p.price)
                  : t('contact')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {p.purpose === 'buy' ? t('forSale') : t('forRent')} ·{' '}
                {customerT(`home.propertyTypes.${p.type.toLowerCase()}`)}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 border-y border-gray-100 py-4">
                {p.area && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{p.area}</p>
                    <p className="text-xs text-gray-500">{t('squareMeters')}</p>
                  </div>
                )}
                {p.bedrooms && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {p.bedrooms}
                    </p>
                    <p className="text-xs text-gray-500">{t('bedrooms')}</p>
                  </div>
                )}
                {p.bathrooms && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {p.bathrooms}
                    </p>
                    <p className="text-xs text-gray-500">{t('bathrooms')}</p>
                  </div>
                )}
              </div>

              {p.description && (
                <div className="mt-4">
                  <h2 className="font-semibold text-gray-900">
                    {t('descriptionTitle')}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <h2 className="font-semibold text-gray-900">{t('address')}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {p.city}
                  {p.district ? `, ${p.district}` : ''}
                  {p.address ? ` - ${p.address}` : ''}
                </p>
              </div>

              {p.broker && (
                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <h2 className="font-semibold text-gray-900">{t('broker')}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {p.broker.fullName}
                  </p>
                  {p.broker.phone && (
                    <p className="text-sm text-blue-600">{p.broker.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Contact form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">
                {t('contactNow')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t('contactPrompt')}</p>

              {leadSent ? (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-sm font-medium text-green-700">
                    {t('sent')}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    {t('sentDescription')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    aria-label={t('name')}
                    placeholder={t('name')}
                    value={leadForm.name}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="tel"
                    required
                    aria-label={t('phone')}
                    placeholder={t('phone')}
                    value={leadForm.phone}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <textarea
                    aria-label={t('message')}
                    placeholder={t('message')}
                    rows={3}
                    value={leadForm.message}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {leadLoading ? t('sending') : t('send')}
                  </button>
                  {leadError && (
                    <p role="alert" className="text-sm text-[var(--danger)]">
                      {t('sendFailed')}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900">{t('similar')}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
