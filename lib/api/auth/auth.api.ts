import { apiClient } from '../client';
import type {
  AuthenticatedPrincipal,
  LoginRequest,
  RegisterRequest,
  TokenPair,
  User,
} from './auth.types';

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<TokenPair>('/auth/login', data);
  },

  register(data: RegisterRequest) {
    return apiClient.post<void>('/auth/register', data);
  },

  getProfile() {
    return apiClient.get<User | AuthenticatedPrincipal>('/auth/profile');
  },
};
