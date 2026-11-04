import type { EstateMedia } from './media.api';

/** Public media uses lowercase `image`; mediaUrl is a storage key, not a URL. */
export function getEstateImages(
  media: readonly EstateMedia[],
  estateId: string,
) {
  return media
    .filter((item) => item.estateId === estateId && item.type === 'image')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
