'use client';

import { EstateGallery } from '@/components/shared/estate-gallery';
import { useEstateMedia } from '@/hooks/use-estate-media';

/** Marketplace adapter: the shared gallery itself does not fetch data. */
export function PropertyGallery({
  estateId,
  title,
}: {
  estateId: string;
  title: string;
}) {
  const media = useEstateMedia(estateId);
  return (
    <EstateGallery
      estateId={estateId}
      title={title}
      media={media.data}
      loading={media.isLoading}
      error={media.isError}
      onRetry={() => void media.refetch()}
    />
  );
}
