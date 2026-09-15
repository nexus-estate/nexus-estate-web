import { administrationApiClient, publicApiClient } from '../client';
import type { AdminTokenPair } from './types';
export const administrationAuthenticationApi = {
  login: (data: { email: string; password: string }) =>
    publicApiClient.post<AdminTokenPair>('/administration/auth/login', data),
  refresh: (refreshToken: string) =>
    publicApiClient.post<AdminTokenPair>('/administration/auth/refresh', {
      refreshToken,
    }),
  logout: (refreshToken: string) =>
    administrationApiClient.post<{ loggedOut: true }>(
      '/administration/auth/logout',
      { refreshToken },
    ),
};
