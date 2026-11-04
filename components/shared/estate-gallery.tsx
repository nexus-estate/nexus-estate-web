'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MarketplaceIcon } from '@/components/customer/marketplace-icon';
import { getEstateImages } from '@/lib/api/media/estate-images';
import type { EstateMedia } from '@/lib/api/media/media.api';
import { PropertyGalleryImage } from './estate-gallery-image';
import { PropertyGalleryModal } from './estate-gallery-modal';

export function EstateGallery({
  estateId,
  title,
  media = [],
  loading = false,
  error = false,
  onRetry,
  marketplace = false,
  provider = false,
}: {
  estateId: string;
  title: string;
  media?: readonly EstateMedia[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  marketplace?: boolean;
  provider?: boolean;
}) {
  const t = useTranslations('customer.gallery');
  const images = getEstateImages(media, estateId);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [coverIndex, setCoverIndex] = useState(0);
  const currentCover = coverIndex % (images.length || 1);

  if (loading) {
    return (
      <div
        role="status"
        aria-label={t('loading')}
        className={`skeleton aspect-[4/3] w-full rounded-[var(--radius-xl)] md:aspect-[16/7] ${marketplace ? 'mp-gallery-placeholder' : ''}`}
      />
    );
  }
  if (error || !images.length) {
    return (
      <div
        role={error ? 'alert' : undefined}
        className={`flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--text-muted)] md:aspect-[16/7] ${marketplace ? 'mp-gallery-placeholder' : ''}`}
      >
        <p>{error ? t('error') : t('empty')}</p>
        {error && onRetry && (
          <button
            type="button"
            className="app-button px-5 py-2"
            onClick={onRetry}
          >
            {t('retry')}
          </button>
        )}
      </div>
    );
  }

  const visibleCount = marketplace || provider ? 5 : 4;
  const previews = images.slice(1, visibleCount);
  return (
    <section
      aria-label={t('title', { title })}
      className={
        marketplace ? 'mp-gallery' : provider ? 'provider-gallery' : 'relative'
      }
    >
      <div
        className={
          marketplace
            ? `mp-gallery-grid ${previews.length ? 'has-previews' : ''}`
            : provider
              ? `provider-gallery-grid ${previews.length ? 'has-previews' : ''}`
              : `grid gap-2 ${previews.length ? 'md:grid-cols-[1.9fr_1fr]' : ''}`
        }
      >
        <button
          type="button"
          onClick={() => setActiveIndex(currentCover)}
          aria-label={t('open', { number: currentCover + 1 })}
          className={
            marketplace
              ? 'mp-gallery-main'
              : provider
                ? 'provider-gallery-main'
                : 'relative aspect-[16/11] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-muted)] md:aspect-auto md:min-h-[380px] lg:min-h-[460px]'
          }
        >
          <PropertyGalleryImage
            image={images[currentCover]}
            title={t('image', { title, number: currentCover + 1 })}
            preload
          />
          {!marketplace && (
            <span className="absolute bottom-3 right-3 flex min-h-10 items-center rounded-[var(--radius-md)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--brand)] shadow-[var(--shadow-sm)] md:hidden">
              {t('view', { count: images.length })}
            </span>
          )}
        </button>
        {previews.length > 0 && (
          <div
            className={
              marketplace
                ? `mp-gallery-previews count-${previews.length}`
                : provider
                  ? `provider-gallery-previews count-${previews.length}`
                  : `grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} md:grid-cols-1`
            }
          >
            {previews.map((image, previewIndex) => {
              const index = previewIndex + 1;
              const remaining = images.length - visibleCount;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('open', { number: index + 1 })}
                  className={
                    marketplace
                      ? 'mp-gallery-thumbnail'
                      : provider
                        ? 'provider-gallery-thumbnail'
                        : 'relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-muted)] md:aspect-auto'
                  }
                >
                  <PropertyGalleryImage
                    image={image}
                    title={t('image', { title, number: index + 1 })}
                  />
                  {previewIndex === previews.length - 1 && remaining > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                      {t('more', { count: remaining })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {(marketplace || provider) && images.length > 1 && (
        <div
          className={`${marketplace ? 'mp-gallery-arrows' : 'provider-gallery-arrows'} ${previews.length ? 'has-previews' : ''}`}
        >
          <button
            type="button"
            aria-label={t('previous')}
            onClick={() =>
              setCoverIndex((currentCover - 1 + images.length) % images.length)
            }
          >
            <MarketplaceIcon name="arrow" className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label={t('next')}
            onClick={() => setCoverIndex((currentCover + 1) % images.length)}
          >
            <MarketplaceIcon name="arrow" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setActiveIndex(0)}
        className={
          marketplace
            ? 'mp-gallery-view'
            : provider
              ? 'provider-gallery-view'
              : 'absolute bottom-4 right-4 hidden min-h-10 rounded-[var(--radius-md)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--brand)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--surface-hover)] md:block'
        }
      >
        {t('view', { count: images.length })}
      </button>
      {activeIndex !== null && (
        <PropertyGalleryModal
          images={images}
          title={title}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </section>
  );
}
