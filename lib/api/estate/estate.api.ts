import { publicApiClient, providerApiClient } from '../client';
import type {
  CreateEstateRequest,
  Estate,
  Province,
  UpdateEstateRequest,
  Ward,
} from './estate.types';

export const estateApi = {
  listMine: () => providerApiClient.get<Estate[]>('/estates/mine'),
  getMine: (id: string) => providerApiClient.get<Estate>(`/estates/${id}/mine`),
  /**
   * `init` is forwarded so Server Components can opt into caching
   * (`{ next: { revalidate } }`) or explicit `no-store`.
   */
  getById: (id: string, init?: RequestInit) =>
    publicApiClient.get<Estate>(`/estates/${id}`, init),
  create: (data: CreateEstateRequest) =>
    providerApiClient.post<Estate>('/estates', data),
  update: (id: string, data: UpdateEstateRequest) =>
    providerApiClient.patch<Estate>(`/estates/${id}`, data),
  activate: (id: string) =>
    providerApiClient.post<Estate>(`/estates/${id}/activate`),
  archive: (id: string) =>
    providerApiClient.post<Estate>(`/estates/${id}/archive`),
  restore: (id: string) =>
    providerApiClient.post<Estate>(`/estates/${id}/restore`),
  /** Legacy DELETE compatibility; lifecycle UI uses archive(). */
  remove: (id: string) => providerApiClient.delete<boolean>(`/estates/${id}`),
};

/**
 * `init` is forwarded so Server Components can opt into caching
 * (`{ next: { revalidate } }`) or explicit `no-store`.
 */
export const locationApi = {
  provinces: (init?: RequestInit) =>
    publicApiClient.get<Province[]>('/locations/provinces', init),
  wards: (provinceId: string, init?: RequestInit) =>
    publicApiClient.get<Ward[]>(
      `/locations/provinces/${provinceId}/wards`,
      init,
    ),
};
