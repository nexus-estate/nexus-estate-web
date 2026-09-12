import { apiClient } from '../client';
import type {
  CreatePropertyInput,
  Property,
  PropertyFilters,
  PropertyListResponse,
} from './property.types';

function queryString(filters: PropertyFilters = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const propertyApi = {
  list(filters: PropertyFilters = {}, init?: RequestInit) {
    return apiClient.get<PropertyListResponse | Property[]>(
      `/properties${queryString(filters)}`,
      init,
    );
  },

  getById(id: string) {
    return apiClient
      .get<Property | { property: Property }>(`/properties/${id}`)
      .then((response) =>
        'property' in response ? response.property : response,
      );
  },

  create(data: CreatePropertyInput) {
    return apiClient.post<Property>('/properties', data);
  },
};
