import { apiClient } from '../client';
import type { Property } from '../property/property.types';

export const searchApi = {
  properties(query: string, page?: number, limit?: number) {
    const params = new URLSearchParams({ query });
    if (page !== undefined) params.set('page', String(page));
    if (limit !== undefined) params.set('limit', String(limit));
    return apiClient.get<Property[]>(`/search?${params.toString()}`);
  },

  similarProperties(id: string, limit?: number) {
    const query = limit === undefined ? '' : `?limit=${limit}`;
    return apiClient.get<Property[]>(
      `/recommendations/properties/${id}/similar${query}`,
    );
  },

  hotProperties(limit?: number) {
    const query = limit === undefined ? '' : `?limit=${limit}`;
    return apiClient.get<Property[]>(`/recommendations/properties/hot${query}`);
  },
};
