import { customerApiClient, publicApiClient } from '../client';
import type { TokenPair, CustomerProfile } from './types';
export const customerAuthenticationApi = {
  login: (data: { email?: string; identifier?: string; password: string }) =>
    publicApiClient.post<TokenPair>('/customers/auth/login', data),
  register: <T = CustomerProfile>(data: object) =>
    publicApiClient.post<T>('/customers/register', data),
  refresh: (refreshTokenString: string) =>
    publicApiClient.post<TokenPair>('/customers/auth/refresh', {
      refreshTokenString,
    }),
  logout: (refreshTokenString: string) =>
    customerApiClient.post<{ loggedOut: true }>('/customers/auth/logout', {
      refreshTokenString,
    }),
  profile: () =>
    customerApiClient.get<CustomerProfile>('/customers/auth/profile'),
};
