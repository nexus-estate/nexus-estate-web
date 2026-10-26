import { publicApiClient, providerApiClient } from '../client';
import { getBrowserApiBaseUrl } from '../core/base-url';

export interface EstateMedia {
  id: string;
  estateId: string;
  mediaUrl: string;
  type: 'image';
  sortOrder: number;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const mediaApi = {
  listPublic: (estateId: string) =>
    publicApiClient.get<EstateMedia[]>(
      `/estates/${encodeURIComponent(estateId)}/media`,
    ),
  imageUrl: (estateId: string, mediaId: string) =>
    `${getBrowserApiBaseUrl()}/estates/${encodeURIComponent(estateId)}/media/${encodeURIComponent(mediaId)}/content`,
  upload: (estateId: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return providerApiClient.upload<EstateMedia>(
      `/estates/${encodeURIComponent(estateId)}/media`,
      body,
    );
  },
};
