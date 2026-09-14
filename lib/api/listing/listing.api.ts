import { apiClient } from '../client';
import type { CreateListingInput, Listing } from './listing.types';

export const listingApi = {
  list(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page !== undefined) params.set('page', String(page));
    if (limit !== undefined) params.set('limit', String(limit));
    const query = params.toString();
    return apiClient.get<Listing[]>(`/listings${query ? `?${query}` : ''}`);
  },

  create(data: CreateListingInput) {
    return apiClient.post<Listing>('/listings', data);
  },

  publish(id: string) {
    return apiClient.post<Listing>(`/listings/${id}/publish`);
  },
};
