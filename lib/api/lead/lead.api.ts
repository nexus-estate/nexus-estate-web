import { apiClient } from '../client';
import type { CreateLeadInput, Lead } from './lead.types';

export const leadApi = {
  create(data: CreateLeadInput) {
    return apiClient.post<Lead>('/leads', data);
  },
};
