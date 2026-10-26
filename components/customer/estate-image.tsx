'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEstateMedia } from '@/hooks/use-estate-media';
import { getEstateImages } from '@/lib/api/media/estate-images';
import { mediaApi } from '@/lib/api/media/media.api';

/** Loads media by estate identity for both public estates and listing cards. */
export function EstateImage({
  estateId,
  title,
  sizes,
  className = 'object-cover',
  preload = false,
}: {
  estateId: string;
  title: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  const t = useTranslations('customer.properties');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const media = useEstateMedia(estateId);
  const cover = getEstateImages(media.data ?? [], estateId)[0];
  const src = cover ? mediaApi.imageUrl(estateId, cover.id) : null;

  if (!src || failedSrc === src) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-[#e7eee9] px-4 text-center text-sm text-[#65746b] ${className}`}
      >
        <span>{media.isLoading ? t('loadingImage') : t('noImage')}</span>
      </div>
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={title}
      fill
      unoptimized
      preload={preload}
      sizes={sizes}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
