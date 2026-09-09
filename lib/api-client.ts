import { Configuration, ApiClient } from '@/lib/sdk';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  PaginationMeta,
  Property,
} from '@/lib/sdk';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = accessToken ?? localStorage.getItem('nexus_access_token');
  return stored;
}

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1',
  accessToken: () => getAccessToken(),
});

const client = new ApiClient(config);

export const apiClient = client;
export { Configuration, ApiClient };
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  PaginationMeta,
  Property,
};
