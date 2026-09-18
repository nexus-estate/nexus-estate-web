import { publicApiClient } from '../client';
import type { CreateLeadInput, Lead } from './lead.types';

export const leadApi = {
  create(listingId: string, data: CreateLeadInput) {
    return publicApiClient.post<Lead>(`/listings/${listingId}/leads`, data);
  },
};
