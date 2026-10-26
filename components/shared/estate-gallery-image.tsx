'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { mediaApi, type EstateMedia } from '@/lib/api/media/media.api';

export function PropertyGalleryImage({
  image,
  title,
  contain = false,
  preload = false,
}: {
  image: EstateMedia;
  title: string;
  contain?: boolean;
  preload?: boolean;
}) {
  const t = useTranslations('customer.gallery');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = mediaApi.imageUrl(image.estateId, image.id);

  if (failedSrc === src) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-muted)]">
        {t('imageError')}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={title}
      fill
      unoptimized
      preload={preload}
      sizes={contain ? '100vw' : '(min-width: 768px) 65vw, 100vw'}
      className={contain ? 'object-contain' : 'object-cover'}
      onError={() => setFailedSrc(src)}
    />
  );
}
