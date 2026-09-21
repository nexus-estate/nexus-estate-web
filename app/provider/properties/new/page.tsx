'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/portal/page-header';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useCreateProviderProperty } from '@/features/provider/supply/provider-supply.queries';
import { locationApi } from '@/lib/api/estate/estate.api';
import type {
  EstatePurpose,
  EstateType,
  Province,
  Ward,
} from '@/lib/api/estate/estate.types';

const ESTATE_TYPES: EstateType[] = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'TOWNHOUSE',
  'LAND',
  'OFFICE',
  'SHOPHOUSE',
  'WAREHOUSE',
  'COMMERCIAL',
  'HOTEL',
  'RESORT',
  'FARM',
  'OTHER',
];
const ESTATE_PURPOSES: EstatePurpose[] = ['SALE', 'RENT', 'SALE_OR_RENT'];

const CONTROL_CLASS =
  'mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]';
const LABEL_CLASS = 'block text-sm font-medium text-[var(--text)]';

/**
 * Creates a Property only. Listing creation is a separate explicit flow on
 * /provider/listings/new; no Listing is created or published here.
 */
export default function NewProviderPropertyPage() {
  const router = useRouter();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const createProperty = useCreateProviderProperty();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'APARTMENT' as EstateType,
    purpose: 'SALE' as EstatePurpose,
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    addressLine: '',
    provinceId: '',
    wardId: '',
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    let cancelled = false;
    void locationApi
      .provinces()
      .then((data) => {
        if (!cancelled) setProvinces(data);
      })
      .catch(() => {
        if (!cancelled) setProvinces([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.provinceId) return;
    let cancelled = false;
    void locationApi
      .wards(form.provinceId)
      .then((data) => {
        if (!cancelled) setWards(data);
      })
      .catch(() => {
        if (!cancelled) setWards([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.provinceId]);

  const canMutate = workspace.canMutate && !createProperty.isPending;
  const blockedByLifecycle =
    workspace.state !== 'LOADING' && workspace.state !== 'ACTIVE_VERIFIED';

  const handleChange =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canMutate) return;
    try {
      const estate = await createProperty.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        purpose: form.purpose,
        price: Number.parseFloat(form.price) || 0,
        area: form.area ? Number.parseFloat(form.area) : undefined,
        bedrooms: form.bedrooms
          ? Number.parseInt(form.bedrooms, 10)
          : undefined,
        bathrooms: form.bathrooms
          ? Number.parseInt(form.bathrooms, 10)
          : undefined,
        addressLine: form.addressLine,
        provinceId: form.provinceId,
        wardId: form.wardId,
      });
      router.push('/provider/properties');
      void estate;
    } catch {
      // Error surfaces through the mutation state below.
    }
  };

  return (
    <>
      <PageHeader
        title={t('properties.newTitle')}
        description={t('properties.newDescription')}
      />
      {blockedByLifecycle && (
        <p className="mb-4 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {createProperty.isError && (
          <p
            role="alert"
            className="border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {t('properties.createFailed')}
          </p>
        )}

        <div className="space-y-4 border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <label className={LABEL_CLASS} htmlFor="estate-title">
              {t('properties.fields.title')}
            </label>
            <input
              id="estate-title"
              type="text"
              required
              value={form.title}
              onChange={handleChange('title')}
              className={CONTROL_CLASS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-type">
                {t('properties.fields.type')}
              </label>
              <select
                id="estate-type"
                value={form.type}
                onChange={handleChange('type')}
                className={CONTROL_CLASS}
              >
                {ESTATE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`properties.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-purpose">
                {t('properties.fields.purpose')}
              </label>
              <select
                id="estate-purpose"
                value={form.purpose}
                onChange={handleChange('purpose')}
                className={CONTROL_CLASS}
              >
                {ESTATE_PURPOSES.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {t(`properties.purposes.${purpose}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-price">
                {t('properties.fields.price')}
              </label>
              <input
                id="estate-price"
                type="number"
                min="0"
                required
                value={form.price}
                onChange={handleChange('price')}
                className={CONTROL_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-area">
                {t('properties.fields.area')}
              </label>
              <input
                id="estate-area"
                type="number"
                min="0"
                value={form.area}
                onChange={handleChange('area')}
                className={CONTROL_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-bedrooms">
                {t('properties.fields.bedrooms')}
              </label>
              <input
                id="estate-bedrooms"
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={handleChange('bedrooms')}
                className={CONTROL_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="estate-bathrooms">
              {t('properties.fields.bathrooms')}
            </label>
            <input
              id="estate-bathrooms"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={handleChange('bathrooms')}
              className={`${CONTROL_CLASS} sm:w-1/3`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="estate-description">
              {t('properties.fields.description')}
            </label>
            <textarea
              id="estate-description"
              rows={4}
              value={form.description}
              onChange={handleChange('description')}
              className={`${CONTROL_CLASS} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-province">
                {t('properties.fields.province')}
              </label>
              <select
                id="estate-province"
                required
                value={form.provinceId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    provinceId: event.target.value,
                    wardId: '',
                  }))
                }
                className={CONTROL_CLASS}
              >
                <option value="">
                  {t('properties.fields.provincePlaceholder')}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="estate-ward">
                {t('properties.fields.ward')}
              </label>
              <select
                id="estate-ward"
                required
                value={form.wardId}
                onChange={handleChange('wardId')}
                disabled={!form.provinceId}
                className={CONTROL_CLASS}
              >
                <option value="">
                  {t('properties.fields.wardPlaceholder')}
                </option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="estate-address">
              {t('properties.fields.addressLine')}
            </label>
            <input
              id="estate-address"
              type="text"
              required
              value={form.addressLine}
              onChange={handleChange('addressLine')}
              className={CONTROL_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canMutate}
            className="bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {createProperty.isPending
              ? t('properties.submitting')
              : t('properties.create')}
          </button>
          <Link
            href="/provider/properties"
            className="border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            {t('properties.cancel')}
          </Link>
        </div>
      </form>
    </>
  );
}
