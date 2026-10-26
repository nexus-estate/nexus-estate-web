'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
}: {
  estateId: string;
  title: string;
  media?: readonly EstateMedia[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const t = useTranslations('customer.gallery');
  const images = getEstateImages(media, estateId);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div
        role="status"
        aria-label={t('loading')}
        className="skeleton aspect-[4/3] w-full rounded-[var(--radius-xl)] md:aspect-[16/7]"
      />
    );
  }
  if (error || !images.length) {
    return (
      <div
        role={error ? 'alert' : undefined}
        className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--text-muted)] md:aspect-[16/7]"
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

  const previews = images.slice(1, 4);
  return (
    <section aria-label={t('title', { title })} className="relative">
      <div
        className={`grid gap-2 ${previews.length ? 'md:grid-cols-[1.9fr_1fr]' : ''}`}
      >
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          aria-label={t('open', { number: 1 })}
          className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-muted)] md:aspect-auto md:min-h-[380px] lg:min-h-[460px]"
        >
          <PropertyGalleryImage
            image={images[0]}
            title={t('image', { title, number: 1 })}
            preload
          />
          <span className="absolute bottom-3 right-3 flex min-h-10 items-center rounded-[var(--radius-md)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--brand)] shadow-[var(--shadow-sm)] md:hidden">
            {t('view', { count: images.length })}
          </span>
        </button>
        {previews.length > 0 && (
          <div
            className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} md:grid-cols-1`}
          >
            {previews.map((image, previewIndex) => {
              const index = previewIndex + 1;
              const remaining = images.length - 4;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('open', { number: index + 1 })}
                  className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-muted)] md:aspect-auto"
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
      <button
        type="button"
        onClick={() => setActiveIndex(0)}
        className="absolute bottom-4 right-4 hidden min-h-10 rounded-[var(--radius-md)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--brand)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--surface-hover)] md:block"
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
