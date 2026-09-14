import { ApiError, createApiError, isRecord } from './errors';

const ACCESS_TOKEN_KEY = 'nexus_access_token';
const DEFAULT_API_URL = 'http://localhost:3001/api';
const DEFAULT_TIMEOUT_MS = 15_000;

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(
    /\/$/,
    '',
  );
}

function unwrap<T>(payload: unknown): T {
  if (
    isRecord(payload) &&
    'data' in payload &&
    (payload.status === true || 'timestamp' in payload || 'path' in payload)
  ) {
    return payload.data as T;
  }
  return payload as T;
}

export interface ApiClientOptions {
  timeoutMs?: number;
  credentials?: RequestCredentials;
}

class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...init, method: 'GET' });
  }

  async post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...init,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    init?: RequestInit,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...init,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async delete<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...init, method: 'DELETE' });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        ...init,
        headers,
        credentials: this.options.credentials ?? 'same-origin',
        signal: init.signal ?? controller.signal,
      });
      const requestId = response.headers.get('x-request-id') ?? undefined;
      const text = await response.text();
      let payload: unknown;
      try {
        payload = text ? JSON.parse(text) : undefined;
      } catch {
        payload = text;
      }

      if (!response.ok) {
        throw createApiError(
          response.status,
          payload,
          response.statusText,
          requestId,
        );
      }

      return response.status === 204 ? (undefined as T) : unwrap<T>(payload);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', { status: 408 });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const apiClient = new ApiClient();
