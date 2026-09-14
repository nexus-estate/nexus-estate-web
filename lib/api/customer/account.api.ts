import { customerApiClient } from '../client';
import type { CustomerProfile } from './types';
export const customerAccountApi = {
  me: () => customerApiClient.get<CustomerProfile>('/customers/me'),
};
