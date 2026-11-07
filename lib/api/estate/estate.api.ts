import { publicApiClient, providerApiClient } from '../client';
import type {
  AdministrativeUnitType,
  CreateEstateRequest,
  Estate,
  Province,
  UpdateEstateRequest,
  Ward,
} from './estate.types';

export const estateApi = {
  listPublic: () => publicApiClient.get<Estate[]>('/estates'),
  listMine: () => providerApiClient.get<Estate[]>('/estates/mine'),
  getMine: (id: string) => providerApiClient.get<Estate>(`/estates/${id}/mine`),
  getById: (id: string) => publicApiClient.get<Estate>(`/estates/${id}`),
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

export const locationApi = {
  // The API serves every administrative unit through the wards endpoint.
  units: async (provinceId: string, type: AdministrativeUnitType) => {
    const units = await locationApi.wards(provinceId);
    return units.filter((unit) => unit.type === type);
  },
  provinces: () => publicApiClient.get<Province[]>('/locations/provinces'),
  wards: (provinceId: string) =>
    publicApiClient.get<Ward[]>(`/locations/provinces/${provinceId}/wards`),
};
