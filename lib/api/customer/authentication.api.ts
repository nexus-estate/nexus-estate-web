import { customerApiClient, publicApiClient } from '../client';
import type {
  CustomerAccount,
  LoginCustomerRequest,
  RegisterCustomerRequest,
  TokenPair,
} from './types';
export const customerAuthenticationApi = {
  login: (data: LoginCustomerRequest) =>
    publicApiClient.post<TokenPair>('/customers/auth/login', data),
  register: (data: RegisterCustomerRequest) =>
    publicApiClient.post<CustomerAccount>('/customers/register', data),
  refresh: (refreshTokenString: string) =>
    publicApiClient.post<TokenPair>('/customers/auth/refresh', {
      refreshTokenString,
    }),
  logout: (refreshTokenString: string) =>
    customerApiClient.post<{ loggedOut: true }>('/customers/auth/logout', {
      refreshTokenString,
    }),
  profile: () =>
    customerApiClient.get<CustomerAccount>('/customers/auth/profile'),
};
