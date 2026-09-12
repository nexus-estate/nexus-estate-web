import { apiClient } from '../client';
import type {
  ChangePasswordResponse,
  UpdateProfileRequest,
  User,
} from './user.types';

export const userApi = {
  getMe() {
    return apiClient.get<User>('/users/me');
  },

  getById(id: string) {
    return apiClient.get<User>(`/users/${id}`);
  },

  update(id: string, data: UpdateProfileRequest) {
    return apiClient.patch<User, UpdateProfileRequest>(`/users/${id}`, data);
  },

  changePassword(id: string, oldPassword: string, newPassword: string) {
    return apiClient.post<ChangePasswordResponse>(
      '/users/' + id + '/change-password',
      {
        oldPassword,
        newPassword,
      },
    );
  },
};
