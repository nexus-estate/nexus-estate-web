'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import '@/app/provider/properties/new/new-property.css';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { EstateMediaUpload } from '@/components/media/estate-media-upload';
import { EstateGallery } from '@/components/shared/estate-gallery';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useCreateProviderProperty,
  useUpdateProviderProperty,
  useProviderEstateMedia,
} from '@/features/provider/supply/provider-supply.queries';
import { useLocations } from '@/hooks/use-locations';
import { ApiError } from '@/lib/api/core/error';
import type {
  Estate,
  EstatePurpose,
  EstateType,
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

function PropertyIcon({ kind = 'building' }: { kind?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'LAND' ? (
        <>
          <path d="M16 21s8-7 8-12a8 8 0 0 0-16 0c0 5 8 12 8 12Z" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="m8 22-4 7h24l-4-7" />
        </>
      ) : kind === 'HOUSE' || kind === 'VILLA' ? (
        <>
          <path d="m3 15 13-11 13 11M7 12v16h18V12M13 28V18h6v10" />
        </>
      ) : (
        <>
          <path d="M5 29V5l13-3v27M18 12l9 3v14M2 29h28" />
          <path d="M9 8h2m3-1h1M9 13h2m3-1h1M9 18h2m3-1h1M9 23h2m3-1h1m7-4h1m-1 5h1" />
        </>
      )}
    </svg>
  );
}

/** Shared property profile form; publishing remains a separate action. */
export function PropertyEditor({ estate }: { estate?: Estate }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('provider');
  const workspace = useProviderAuthorization();
  const createProperty = useCreateProviderProperty();
  const updateProperty = useUpdateProviderProperty();
  const mutation = estate ? updateProperty : createProperty;
  const submitLock = useRef(false);
  const [uploading, setUploading] = useState(false);
  const media = useProviderEstateMedia(
    estate?.id ?? '',
    !!estate && estate.status === 'ACTIVE',
  );
  const backHref = estate
    ? `/provider/properties/${encodeURIComponent(estate.id)}`
    : '/provider/properties';

  const [form, setForm] = useState({
    title: estate?.title ?? '',
    description: estate?.description ?? '',
    type: estate?.type ?? ('APARTMENT' as EstateType),
    purpose: estate?.purpose ?? ('SALE' as EstatePurpose),
    price: estate?.price.toString() ?? '',
    area: estate?.area?.toString() ?? '',
    bedrooms: estate?.bedrooms?.toString() ?? '',
    bathrooms: estate?.bathrooms?.toString() ?? '',
    addressLine: estate?.addressLine ?? '',
    provinceId: estate?.provinceId ?? '',
    wardId: estate?.wardId ?? '',
  });

  const [unitType, setUnitType] = useState<'ward' | 'commune'>('ward');
  // Existing Estate responses omit the administrative unit type.
  const [locationChanged, setLocationChanged] = useState(false);
  const { provinces, wards, wardsPending } = useLocations(
    form.provinceId,
    estate && !locationChanged ? undefined : unitType,
  );

  const canSubmit =
    workspace.hasProviderPermission(
      estate ? 'property:update' : 'property:create',
    ) &&
    !mutation.isPending &&
    !uploading &&
    workspace.state === 'ACTIVE_VERIFIED';
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
    if (!canSubmit || submitLock.current) return;
    submitLock.current = true;
    try {
      const data = {
        title: form.title.trim(),
        description: estate ? form.description : form.description || undefined,
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
        addressLine: form.addressLine.trim(),
        provinceId: form.provinceId,
        wardId: form.wardId,
      };
      if (estate) await updateProperty.mutateAsync({ id: estate.id, data });
      else await createProperty.mutateAsync(data);
      router.push(backHref);
    } catch {
      // Error surfaces through the mutation state below.
    } finally {
      submitLock.current = false;
    }
  };

  const address = [
    form.addressLine,
    wards.find((ward) => ward.id === form.wardId)?.name ??
      (form.wardId === estate?.wardId ? estate.ward.name : ''),
    provinces.find((province) => province.id === form.provinceId)?.name ??
      (form.provinceId === estate?.provinceId ? estate.province.name : ''),
  ]
    .filter(Boolean)
    .join(', ');
  const price = form.price
    ? new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(Number(form.price)) + ' ₫'
    : t('properties.editor.priceEmpty');
  const field = (
    key: 'title' | 'price' | 'area' | 'bedrooms' | 'bathrooms' | 'addressLine',
    required = false,
    unit?: string,
  ) => (
    <div className={`estate-field estate-field-${key}`}>
      <label htmlFor={`estate-${key}`}>
        {t(`properties.editor.labels.${key}`)}
        {required && <span className="estate-required"> *</span>}
      </label>
      <div className="estate-input-wrap">
        <input
          id={`estate-${key}`}
          type={
            ['price', 'area', 'bedrooms', 'bathrooms'].includes(key)
              ? 'number'
              : 'text'
          }
          min={
            ['price', 'area', 'bedrooms', 'bathrooms'].includes(key)
              ? key === 'area'
                ? '0.01'
                : '0'
              : undefined
          }
          step={key === 'area' ? 'any' : undefined}
          max={key === 'bedrooms' || key === 'bathrooms' ? 100 : undefined}
          maxLength={key === 'addressLine' ? 500 : undefined}
          placeholder={
            key === 'addressLine'
              ? t('properties.editor.addressPlaceholder')
              : undefined
          }
          required={required}
          value={form[key]}
          onChange={handleChange(key)}
        />
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
  const sectionHeading = (
    number: string,
    key: 'basic' | 'location' | 'images',
    description?: string,
  ) => (
    <div className="estate-section-heading">
      <span>{number}</span>
      <div>
        <h2>{t(`properties.editor.${key}`)}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="estate-editor">
      <nav
        aria-label={t('properties.editor.breadcrumb')}
        className="estate-breadcrumb"
      >
        <Link href="/provider" aria-label={t('nav.overview')}>
          ⌂
        </Link>
        <span>›</span>
        <Link href="/provider/properties">{t('properties.title')}</Link>
        <span>/</span>
        <span>{t(estate ? 'properties.edit' : 'properties.editor.new')}</span>
      </nav>
      <header className="estate-editor-header">
        <div>
          <h1>{t(estate ? 'properties.editTitle' : 'properties.newTitle')}</h1>
          <span className="estate-draft">
            {t(`properties.status.${estate?.status ?? 'DRAFT'}`)}
          </span>
        </div>
        <p>
          {t(
            estate
              ? 'properties.editDescription'
              : 'properties.editor.subtitle',
          )}
        </p>
      </header>
      <nav
        className="estate-section-nav"
        aria-label={t('properties.editor.sections')}
      >
        {(['basic', 'location', 'images'] as const).map((key, index) => (
          <a key={key} href={`#estate-${key}`}>
            0{index + 1} <span>{t(`properties.editor.${key}`)}</span>
          </a>
        ))}
      </nav>
      {blockedByLifecycle && (
        <p role="status" className="estate-notice">
          {t(`lifecycle.${workspace.state.toLowerCase()}`)}
        </p>
      )}
      {workspace.state === 'LOADING' && <p role="status">{t('loading')}</p>}
      <form onSubmit={handleSubmit} aria-busy={mutation.isPending}>
        {mutation.isError && (
          <p role="alert" className="estate-error">
            {mutation.error instanceof ApiError && mutation.error.status === 403
              ? t('permissionDenied')
              : t(
                  estate
                    ? 'properties.updateFailed'
                    : 'properties.createFailed',
                )}
          </p>
        )}
        <div className="estate-editor-columns">
          <div className="estate-editor-sections">
            <section id="estate-basic" className="estate-editor-card">
              {sectionHeading(
                '01',
                'basic',
                t('properties.editor.basicDescription'),
              )}
              {field('title', true)}
              <fieldset className="estate-choice-field">
                <legend>
                  {t('properties.editor.labels.type')}
                  <span className="estate-required"> *</span>
                </legend>
                <div className="estate-type-options">
                  {['APARTMENT', 'HOUSE', 'VILLA', 'LAND'].map((type) => (
                    <label
                      key={type}
                      className={form.type === type ? 'is-selected' : ''}
                    >
                      <input
                        type="radio"
                        name="estate-type"
                        value={type}
                        checked={form.type === type}
                        onChange={handleChange('type')}
                      />
                      <PropertyIcon kind={type} />
                      <span>{t(`properties.types.${type}`)}</span>
                      {form.type === type && (
                        <span className="estate-check">✓</span>
                      )}
                    </label>
                  ))}
                </div>
                <select
                  aria-label={t('properties.editor.otherTypes')}
                  value={
                    ['APARTMENT', 'HOUSE', 'VILLA', 'LAND'].includes(form.type)
                      ? ''
                      : form.type
                  }
                  onChange={(event) => {
                    if (event.target.value)
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as EstateType,
                      }));
                  }}
                >
                  <option value="">{t('properties.editor.otherTypes')}</option>
                  {ESTATE_TYPES.filter(
                    (type) =>
                      !['APARTMENT', 'HOUSE', 'VILLA', 'LAND'].includes(type),
                  ).map((type) => (
                    <option key={type} value={type}>
                      {t(`properties.types.${type}`)}
                    </option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="estate-choice-field">
                <legend>
                  {t('properties.fields.purpose')}
                  <span className="estate-required"> *</span>
                </legend>
                <div className="estate-purpose-options">
                  {ESTATE_PURPOSES.map((purpose) => (
                    <label
                      key={purpose}
                      className={form.purpose === purpose ? 'is-selected' : ''}
                    >
                      <input
                        type="radio"
                        name="estate-purpose"
                        value={purpose}
                        checked={form.purpose === purpose}
                        onChange={handleChange('purpose')}
                      />
                      {t(`properties.purposes.${purpose}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="estate-facts-grid">
                {field('price', true, 'VND')}
                {field('area', false, 'm²')}
                {field('bedrooms')}
                {field('bathrooms')}
              </div>
              <div className="estate-field">
                <label htmlFor="estate-description">
                  {t('properties.fields.description')}
                </label>
                <textarea
                  id="estate-description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange('description')}
                />
              </div>
            </section>
            <section id="estate-location" className="estate-editor-card">
              {sectionHeading('02', 'location')}
              <div className="estate-location-grid">
                <div className="estate-field">
                  <label htmlFor="estate-province">
                    {t('properties.fields.province')}
                    <span className="estate-required"> *</span>
                  </label>
                  <select
                    id="estate-province"
                    required
                    value={form.provinceId}
                    onChange={(event) => {
                      setLocationChanged(true);
                      setForm((current) => ({
                        ...current,
                        provinceId: event.target.value,
                        wardId: '',
                      }));
                    }}
                  >
                    <option value="">
                      {t('properties.fields.provincePlaceholder')}
                    </option>
                    {estate &&
                      !provinces.some(
                        (item) => item.id === estate.provinceId,
                      ) && (
                        <option value={estate.provinceId}>
                          {estate.province.name}
                        </option>
                      )}
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="estate-field">
                  <label htmlFor="estate-unit-type">
                    {t('properties.editor.unitType')}
                  </label>
                  <select
                    id="estate-unit-type"
                    value={estate && !locationChanged ? '' : unitType}
                    onChange={(event) => {
                      setLocationChanged(true);
                      setUnitType(event.target.value as 'ward' | 'commune');
                      setForm((current) => ({ ...current, wardId: '' }));
                    }}
                  >
                    {estate && !locationChanged && (
                      <option value="">
                        {t('properties.editor.keepUnit')}
                      </option>
                    )}
                    {(['ward', 'commune'] as const).map((type) => (
                      <option key={type} value={type}>
                        {t(`properties.editor.unitTypes.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="estate-field">
                  <label htmlFor="estate-ward">
                    {t('properties.editor.ward')}
                    <span className="estate-required"> *</span>
                  </label>
                  <select
                    id="estate-ward"
                    required
                    value={form.wardId}
                    onChange={handleChange('wardId')}
                    disabled={!form.provinceId || wardsPending}
                  >
                    <option value="">
                      {t('properties.editor.wardPlaceholder')}
                    </option>
                    {estate &&
                      !locationChanged &&
                      !wards.some((item) => item.id === estate.wardId) && (
                        <option value={estate.wardId}>
                          {estate.ward.name}
                        </option>
                      )}
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
                {field('addressLine', true)}
              </div>
            </section>
            <section id="estate-images" className="estate-editor-card">
              {sectionHeading(
                '03',
                'images',
                estate ? undefined : t('properties.editor.imagesDescription'),
              )}
              {estate ? (
                estate.status !== 'ARCHIVED' ? (
                  <EstateMediaUpload
                    estateId={estate.id}
                    onBusyChange={(busy) => {
                      setUploading(busy);
                      if (!busy && estate.status === 'ACTIVE')
                        void media.refetch();
                    }}
                  />
                ) : (
                  <p className="estate-notice">
                    {t('properties.editor.archivedImages')}
                  </p>
                )
              ) : (
                <div className="estate-image-note">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="4" y="4" width="24" height="24" rx="3" />
                    <circle cx="12" cy="11" r="2" />
                    <path d="m4 24 8-8 5 5 4-4 7 7" />
                  </svg>
                  <p>{t('properties.editor.imagesDescription')}</p>
                </div>
              )}
            </section>
          </div>
          <aside
            className="estate-preview"
            aria-label={t('properties.editor.preview')}
          >
            <h2>{t('properties.editor.preview')}</h2>
            <div className="estate-preview-body">
              {estate?.status === 'ACTIVE' ? (
                <div className="estate-edit-gallery">
                  <EstateGallery
                    estateId={estate.id}
                    title={form.title}
                    media={media.data}
                    loading={media.isLoading}
                    error={media.isError}
                    onRetry={() => void media.refetch()}
                  />
                </div>
              ) : (
                <div className="estate-preview-image">
                  <PropertyIcon />
                  <span>{t('properties.editor.noImage')}</span>
                </div>
              )}
              <span className="estate-preview-badge">
                {t(`properties.types.${form.type}`)} ·{' '}
                {t(`properties.purposes.${form.purpose}`)}
              </span>
              <h3>{form.title || t('properties.editor.titleEmpty')}</h3>
              <p className="estate-preview-address">
                {address || t('properties.editor.addressEmpty')}
              </p>
              <p className="estate-preview-price">{price}</p>
              <p className="estate-preview-facts">
                {form.area
                  ? `${new Intl.NumberFormat(locale).format(Number(form.area))} m²`
                  : '— m²'}
                {form.bedrooms !== '' &&
                  ` · ${form.bedrooms} ${t('properties.editor.bedroomShort')}`}
                {form.bathrooms !== '' &&
                  ` · ${form.bathrooms} ${t('properties.editor.bathroomShort')}`}
              </p>
              <div className="estate-preview-note">
                <span aria-hidden="true">ⓘ</span>
                <div>
                  <strong>{t('properties.editor.profile')}</strong>
                  <p>
                    {t(
                      estate
                        ? 'properties.editor.updateNote'
                        : 'properties.editor.profileNote',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <div className="estate-editor-actions">
          <p>
            {t(
              estate
                ? 'properties.editor.updateNote'
                : 'properties.editor.editLater',
            )}
          </p>
          <Link
            href={backHref}
            className="estate-cancel"
            aria-disabled={mutation.isPending || uploading}
            onClick={(event) => {
              if (mutation.isPending || uploading) event.preventDefault();
            }}
          >
            {t('properties.cancel')}
          </Link>
          <button type="submit" disabled={!canSubmit}>
            {mutation.isPending
              ? t(estate ? 'properties.updating' : 'properties.submitting')
              : t(estate ? 'properties.update' : 'properties.create')}
            <MarketplaceIcon name={estate ? 'check' : 'arrow'} />
          </button>
        </div>
      </form>
    </div>
  );
}
