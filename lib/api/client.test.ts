import {
  administrationApiClient,
  customerApiClient,
  providerApiClient,
  publicApiClient,
  setRealmAccessToken,
} from './client';
import { ApiError } from './errors';

const fetchMock = jest.fn();

function mockResponse(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    headers: new Headers(headers),
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

describe('apiClient', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:50001/api/v1';
    localStorage.clear();
    document.cookie = 'nexus.locale=; Max-Age=0; Path=/';
    setRealmAccessToken('customer', null);
    setRealmAccessToken('administration', null);
  });

  it('serializes JSON and keeps the public client unauthenticated', async () => {
    fetchMock.mockResolvedValue(mockResponse({ id: 'user-1' }, 200));

    await expect(
      publicApiClient.post<{ id: string }>('/users', { name: 'Nexus' }),
    ).resolves.toEqual({
      id: 'user-1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:50001/api/v1/users',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ name: 'Nexus' }),
      }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(request.headers);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Authorization')).toBeNull();
    expect(headers.get('x-lang')).toBe('en');
  });

  it('propagates the shared locale independently across realm clients', async () => {
    document.cookie = 'nexus.locale=vi; Path=/';
    setRealmAccessToken('customer', 'customer-token');
    setRealmAccessToken('administration', 'admin-token');
    localStorage.setItem('nexus.provider.active_id', 'provider-1');
    fetchMock.mockResolvedValue(mockResponse({}, 200));

    await customerApiClient.get('/customers/me');
    await providerApiClient.get('/providers/me');
    await administrationApiClient.get('/administration/me/authorization');

    const customerHeaders = new Headers(fetchMock.mock.calls[0][1].headers);
    const providerHeaders = new Headers(fetchMock.mock.calls[1][1].headers);
    const adminHeaders = new Headers(fetchMock.mock.calls[2][1].headers);
    expect(customerHeaders.get('Authorization')).toBe('Bearer customer-token');
    expect(customerHeaders.get('x-lang')).toBe('vi');
    expect(providerHeaders.get('Authorization')).toBe('Bearer customer-token');
    expect(providerHeaders.get('X-Provider-Id')).toBe('provider-1');
    expect(providerHeaders.get('x-lang')).toBe('vi');
    expect(adminHeaders.get('Authorization')).toBe('Bearer admin-token');
    expect(adminHeaders.get('X-Provider-Id')).toBeNull();
    expect(adminHeaders.get('x-lang')).toBe('vi');
  });

  it('unwraps the current API envelope and handles no-content responses', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ status: true, data: { ok: true } }, 200),
    );
    fetchMock.mockResolvedValueOnce(mockResponse(undefined, 204));

    await expect(
      publicApiClient.get<{ ok: boolean }>('/health'),
    ).resolves.toEqual({
      ok: true,
    });
    await expect(
      publicApiClient.delete<void>('/sessions/current'),
    ).resolves.toBeUndefined();
  });

  it('normalizes NestJS and stable error envelopes into ApiError', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(
        {
          status: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { userId: 'user-1' },
            requestId: 'request-1',
          },
        },
        404,
        { 'x-request-id': 'header-request' },
      ),
    );

    await expect(
      publicApiClient.get('/users/user-1'),
    ).rejects.toMatchObject<ApiError>({
      name: 'ApiError',
      status: 404,
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      details: { userId: 'user-1' },
      requestId: 'request-1',
    });
  });

  it('supports the current NestJS validation error shape', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(
        {
          statusCode: 400,
          message: ['email must be an email', 'password is too short'],
          error: 'Bad Request',
        },
        400,
      ),
    );

    await expect(
      publicApiClient.post('/customers/auth/login', {}),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'email must be an email, password is too short',
    });
  });
});
