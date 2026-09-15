import {
  DEFAULT_LOCALE,
  LOCALE_KEY,
  normalizeLocale,
  type Locale,
} from '@/lib/constants';
import { ApiError, createApiError, isRecord } from './error';
import { coordinateRefresh } from './refresh-coordinator';
import {
  dispatchRealmSessionExpired,
  markRealmSessionActive,
} from './session-events';
export type Realm = 'customer' | 'administration';
export interface ApiClientConfig {
  realmKey?: Realm | 'default';
  getAccessToken?: () => string | null;
  refreshSession?: () => Promise<string | null>;
  onUnauthorized?: () => void;
  getHeaders?: () => Record<string, string>;
}
export interface ApiClientOptions {
  timeoutMs?: number;
  credentials?: RequestCredentials;
}
const DEFAULT_API_URL = 'http://localhost:50001/api/v1';
const DEFAULT_TIMEOUT_MS = 15_000;
const tokenMemory = new Map<string, string | null>();
export function setRealmAccessToken(realm: Realm, token: string | null) {
  tokenMemory.set(realm, token);
  if (token) markRealmSessionActive(realm);
}
export function getRealmAccessToken(realm: Realm) {
  const memory = tokenMemory.get(realm);
  if (memory !== undefined) return memory;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`nexus.${realm}.access_token`);
}
export function getLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${LOCALE_KEY}=`))
    ?.slice(LOCALE_KEY.length + 1);
  return normalizeLocale(cookie);
}
function unwrap<T>(payload: unknown): T {
  if (
    isRecord(payload) &&
    'data' in payload &&
    (payload.status === true || 'timestamp' in payload || 'path' in payload)
  )
    return payload.data as T;
  return payload as T;
}
export class ApiClient {
  constructor(
    private readonly config: ApiClientConfig = {},
    private readonly options: ApiClientOptions = {},
  ) {}
  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'GET' });
  }
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit) {
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  patch<T, B = unknown>(path: string, body?: B, init?: RequestInit) {
    return this.request<T>(path, {
      ...init,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  put<T, B = unknown>(path: string, body?: B, init?: RequestInit) {
    return this.request<T>(path, {
      ...init,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'DELETE' });
  }
  private async request<T>(
    path: string,
    init: RequestInit,
    retry = false,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (!headers.has('x-lang')) headers.set('x-lang', getLocale());
    if (init.body !== undefined && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
    const token = this.config.getAccessToken?.();
    if (token && !headers.has('Authorization'))
      headers.set('Authorization', `Bearer ${token}`);
    Object.entries(this.config.getHeaders?.() ?? {}).forEach(([key, value]) =>
      headers.set(key, value),
    );
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
    try {
      const response = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '')}${path}`,
        {
          ...init,
          headers,
          credentials: this.options.credentials ?? 'same-origin',
          signal: init.signal ?? controller.signal,
        },
      );
      const requestId = response.headers.get('x-request-id') ?? undefined;
      const text = await response.text();
      let payload: unknown;
      try {
        payload = text ? JSON.parse(text) : undefined;
      } catch {
        payload = text;
      }
      if (
        response.status === 401 &&
        !retry &&
        this.config.refreshSession &&
        !/\/auth\/(refresh|login|logout)$/.test(path)
      ) {
        const key = this.config.realmKey ?? 'default';
        const flight = coordinateRefresh(key, this.config.refreshSession);
        if (await flight) return this.request<T>(path, init, true);
        this.config.onUnauthorized?.();
      }
      if (!response.ok)
        throw createApiError(
          response.status,
          payload,
          response.statusText,
          requestId,
        );
      return response.status === 204 ? (undefined as T) : unwrap<T>(payload);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError')
        throw new ApiError('Request timed out', { status: 408 });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
const customerConfig: ApiClientConfig = {
  realmKey: 'customer',
  getAccessToken: () => getRealmAccessToken('customer'),
  refreshSession: async () => {
    if (typeof window === 'undefined') return null;
    const refresh = localStorage.getItem('nexus.customer.refresh_token');
    if (!refresh) return null;
    try {
      const pair = await publicApiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>('/customers/auth/refresh', { refreshTokenString: refresh });
      localStorage.setItem('nexus.customer.access_token', pair.accessToken);
      localStorage.setItem('nexus.customer.refresh_token', pair.refreshToken);
      setRealmAccessToken('customer', pair.accessToken);
      return pair.accessToken;
    } catch {
      localStorage.removeItem('nexus.customer.access_token');
      localStorage.removeItem('nexus.customer.refresh_token');
      setRealmAccessToken('customer', null);
      return null;
    }
  },
  onUnauthorized: () => dispatchRealmSessionExpired('customer'),
};
const adminConfig: ApiClientConfig = {
  realmKey: 'administration',
  getAccessToken: () => getRealmAccessToken('administration'),
  refreshSession: async () => {
    if (typeof window === 'undefined') return null;
    const refresh = localStorage.getItem('nexus.administration.refresh_token');
    if (!refresh) return null;
    try {
      const pair = await publicApiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>('/administration/auth/refresh', { refreshToken: refresh });
      localStorage.setItem(
        'nexus.administration.access_token',
        pair.accessToken,
      );
      localStorage.setItem(
        'nexus.administration.refresh_token',
        pair.refreshToken,
      );
      setRealmAccessToken('administration', pair.accessToken);
      return pair.accessToken;
    } catch {
      localStorage.removeItem('nexus.administration.access_token');
      localStorage.removeItem('nexus.administration.refresh_token');
      setRealmAccessToken('administration', null);
      return null;
    }
  },
  onUnauthorized: () => dispatchRealmSessionExpired('administration'),
};
export const publicApiClient = new ApiClient();
export const customerApiClient = new ApiClient(customerConfig);
export const providerApiClient = new ApiClient({
  ...customerConfig,
  getHeaders: (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const id = localStorage.getItem('nexus.provider.active_id');
    return id ? { 'X-Provider-Id': id } : {};
  },
});
export const administrationApiClient = new ApiClient(adminConfig);
export const apiClient = publicApiClient;
