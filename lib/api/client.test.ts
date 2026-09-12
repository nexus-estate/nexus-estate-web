import { apiClient, setAccessToken } from './client';
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
    localStorage.clear();
    setAccessToken(null);
  });

  it('serializes JSON and attaches the stored bearer token', async () => {
    localStorage.setItem('nexus_access_token', 'token-123');
    fetchMock.mockResolvedValue(mockResponse({ id: 'user-1' }, 200));

    await expect(
      apiClient.post<{ id: string }>('/users', { name: 'Nexus' }),
    ).resolves.toEqual({
      id: 'user-1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/users',
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
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('unwraps the current API envelope and handles no-content responses', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ status: true, data: { ok: true } }, 200),
    );
    fetchMock.mockResolvedValueOnce(mockResponse(undefined, 204));

    await expect(apiClient.get<{ ok: boolean }>('/health')).resolves.toEqual({
      ok: true,
    });
    await expect(
      apiClient.delete<void>('/sessions/current'),
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
      apiClient.get('/users/user-1'),
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

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'email must be an email, password is too short',
    });
  });
});
