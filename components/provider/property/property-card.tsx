'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { useProviderEstateMedia } from '@/features/provider/supply/provider-supply.queries';
import type { Estate } from '@/lib/api/estate/estate.types';
import { getEstateImages } from '@/lib/api/media/estate-images';
import { mediaApi } from '@/lib/api/media/media.api';

export type PropertyAction = 'activate' | 'archive' | 'restore';

export function PropertyCard({
  estate,
  visibility,
  canUpdate,
  canArchive,
  pending,
  onAction,
}: {
  estate: Estate;
  visibility: 'public' | 'private' | 'unknown';
  canUpdate: boolean;
  canArchive: boolean;
  pending: PropertyAction | null;
  onAction: (action: PropertyAction, estate: Estate) => void;
}) {
  const t = useTranslations('provider');
  const locale = useLocale();
  // Only the visible page mounts cards. Queries run concurrently and share the
  // provider media cache; the public endpoint only supports ACTIVE estates.
  const media = useProviderEstateMedia(estate.id, estate.status === 'ACTIVE');
  const cover = getEstateImages(media.data ?? [], estate.id)[0];
  const src = cover ? mediaApi.imageUrl(estate.id, cover.id) : null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const noImages = estate.status === 'ACTIVE' && media.isSuccess && !cover;
  const imageLabel = media.isLoading
    ? t('loading')
    : noImages
      ? t('properties.editor.noImage')
      : t('properties.inventory.imageUnavailable');
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(estate.price);
  const compactPrice = `${new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'long',
    maximumFractionDigits: 2,
  }).format(estate.price)} ₫`;
  const id = encodeURIComponent(estate.id);

  return (
    <li className="inventory-card" aria-busy={pending !== null}>
      <div className="inventory-thumbnail">
        {src && src !== failedSrc ? (
          <Image
            src={src}
            alt={estate.title}
            fill
            unoptimized
            sizes="(max-width: 700px) 100vw, 220px"
            className="object-cover"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <div className="inventory-placeholder">
            <MarketplaceIcon name="building" />
            <span>{imageLabel}</span>
          </div>
        )}
      </div>
      <div className="inventory-info">
        <div className="inventory-meta">
          <span>{t(`properties.types.${estate.type}`)}</span>
          <span aria-hidden="true">·</span>
          <span className="inventory-purpose">
            {t(`properties.purposes.${estate.purpose}`)}
          </span>
          {noImages && (
            <span className="inventory-image-note">
              {t('properties.editor.noImage')}
            </span>
          )}
        </div>
        <h2 title={estate.title}>{estate.title}</h2>
        <p className="inventory-address">
          <MarketplaceIcon name="pin" />
          <span>
            {[estate.addressLine, estate.ward?.name, estate.province?.name]
              .filter(Boolean)
              .join(', ')}
          </span>
        </p>
        <div className="inventory-facts">
          {estate.price != null && (
            <strong title={price} aria-label={price}>
              {compactPrice}
            </strong>
          )}
          {estate.area != null && <span>{number.format(estate.area)} m²</span>}
          {estate.bedrooms != null && (
            <span>
              {t('properties.inventory.bedrooms', { count: estate.bedrooms })}
            </span>
          )}
          {estate.bathrooms != null && (
            <span>
              {t('properties.inventory.bathrooms', { count: estate.bathrooms })}
            </span>
          )}
        </div>
        {estate.purpose !== 'SALE' && (
          <p className="inventory-price-note">
            {t('properties.inventory.rentalPeriodUnavailable')}
          </p>
        )}
      </div>
      <div className="inventory-actions">
        <span
          className={`property-visibility property-visibility-${visibility}`}
        >
          {t(`unified.${visibility}`)}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {t('unified.promotionUnknown')}
        </span>
        <Link className="inventory-listing" href={`/provider/properties/${id}`}>
          {t('unified.manage')}
        </Link>
        {canUpdate && estate.status === 'DRAFT' && (
          <button
            className="inventory-listing"
            disabled={pending !== null}
            onClick={() => onAction('activate', estate)}
          >
            {t(
              pending === 'activate'
                ? 'properties.activating'
                : 'properties.activate',
            )}
          </button>
        )}
        {canUpdate && estate.status === 'ARCHIVED' && (
          <button
            className="inventory-listing"
            disabled={pending !== null}
            onClick={() => onAction('restore', estate)}
          >
            {t(
              pending === 'restore'
                ? 'properties.restoring'
                : 'properties.restore',
            )}
          </button>
        )}
        {canUpdate && estate.status !== 'ARCHIVED' && (
          <div className="inventory-secondary">
            <Link href={`/provider/properties/${id}/edit`}>
              <span aria-hidden="true">✎</span>
              {t('properties.edit')}
            </Link>
            <Link href={`/provider/media?estateId=${id}`}>
              <MarketplaceIcon name="images" />
              {t(
                noImages
                  ? 'properties.media'
                  : 'properties.inventory.manageImages',
              )}
            </Link>
          </div>
        )}
      </div>
      {canArchive && estate.status !== 'ARCHIVED' && (
        <details
          className="inventory-menu"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}
        >
          <summary
            aria-label={t('properties.inventory.more', { title: estate.title })}
          >
            ⋯
          </summary>
          <div>
            <button
              disabled={pending !== null}
              onClick={(event) => {
                const menu = event.currentTarget.closest('details');
                menu?.removeAttribute('open');
                menu?.querySelector('summary')?.focus();
                onAction('archive', estate);
              }}
            >
              {t(
                pending === 'archive'
                  ? 'properties.archiving'
                  : 'properties.archive',
              )}
            </button>
          </div>
        </details>
      )}
    </li>
  );
}
