import { apiClient } from '../client';

export interface PresignedUpload {
  uploadUrl: string;
  mediaId: string;
  expiresIn: number;
}

export const mediaApi = {
  getPresignedUrl(fileName: string) {
    return apiClient.post<PresignedUpload>('/media/presigned-url', {
      fileName,
    });
  },
};
