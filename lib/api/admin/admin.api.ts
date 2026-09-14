import { apiClient } from '../client';
import type { AdminOverview, AdminUser } from './admin.types';

export const adminApi = {
  getOverview() {
    return apiClient.get<AdminOverview>('/admin/reports/overview');
  },

  listUsers(page = 1, limit = 20) {
    return apiClient.get<AdminUser[]>(
      `/admin/users?page=${page}&limit=${limit}`,
    );
  },

  approveListing(id: string) {
    return apiClient.post<unknown>(`/admin/listings/${id}/approve`);
  },

  rejectListing(id: string, reason: string) {
    return apiClient.post<unknown>(`/admin/listings/${id}/reject`, { reason });
  },
};
