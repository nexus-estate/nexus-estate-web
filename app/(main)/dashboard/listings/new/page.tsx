'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { listingApi } from '@/lib/api/listing/listing.api';

export default function NewListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations('customer.listing');
  const customerT = useTranslations('customer');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    purpose: 'buy',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: '',
    district: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isLoading && !isAuthenticated) {
    router.push('/signin');
    return null;
  }

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await listingApi.create({
        property: {
          title: form.title,
          description: form.description,
          type: form.type,
          purpose: form.purpose,
          price: parseFloat(form.price) || 0,
          area: parseFloat(form.area) || 0,
          bedrooms: parseInt(form.bedrooms) || 0,
          bathrooms: parseInt(form.bathrooms) || 0,
          city: form.city,
          district: form.district,
          address: form.address,
        },
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {t('success')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{t('redirecting')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; {t('back')}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500">{t('description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('basicInfo')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('listingTitle')}
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleChange('title')}
                placeholder={t('titlePlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('type')}
                </label>
                <select
                  value={form.type}
                  onChange={handleChange('type')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="apartment">
                    {customerT('home.propertyTypes.apartment')}
                  </option>
                  <option value="house">
                    {customerT('home.propertyTypes.house')}
                  </option>
                  <option value="villa">
                    {customerT('home.propertyTypes.villa')}
                  </option>
                  <option value="land">
                    {customerT('home.propertyTypes.land')}
                  </option>
                  <option value="office">
                    {customerT('home.propertyTypes.office')}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('purpose')}
                </label>
                <select
                  value={form.purpose}
                  onChange={handleChange('purpose')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="buy">{customerT('properties.buy')}</option>
                  <option value="rent">{customerT('properties.rent')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('price')}
              </label>
              <input
                type="number"
                required
                value={form.price}
                onChange={handleChange('price')}
                placeholder={t('pricePlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('area')}
                </label>
                <input
                  type="number"
                  value={form.area}
                  onChange={handleChange('area')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('bedrooms')}
                </label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange('bedrooms')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('bathrooms')}
                </label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange('bathrooms')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('descriptionLabel')}
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={handleChange('description')}
                placeholder={t('descriptionPlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 pt-2">
              {t('address')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('city')}
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder={t('cityPlaceholder')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('district')}
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={handleChange('district')}
                  placeholder={t('districtPlaceholder')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('addressDetail')}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                placeholder={t('addressPlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
