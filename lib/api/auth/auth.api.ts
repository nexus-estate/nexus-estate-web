import { customerAuthenticationApi } from '../customer/authentication.api';
import type {
  AuthenticatedPrincipal,
  LoginRequest,
  RegisterRequest,
  User,
} from './auth.types';

export const authApi = {
  login(data: LoginRequest) {
    return customerAuthenticationApi.login(data);
  },

  register(data: RegisterRequest) {
    return customerAuthenticationApi.register(data);
  },

  getProfile() {
    return customerAuthenticationApi.profile() as Promise<
      User | AuthenticatedPrincipal
    >;
  },
};
