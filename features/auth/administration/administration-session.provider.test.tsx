import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { administrationAuthenticationApi } from '@/lib/api/administration/authentication.api';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import { setRealmAccessToken } from '@/lib/api/client';
import { dispatchRealmSessionExpired } from '@/lib/api/core/session-events';
import {
  AdministrationSessionProvider,
  useAdministrationSession,
} from './administration-session.provider';

jest.mock('@/lib/api/administration/authentication.api', () => ({
  administrationAuthenticationApi: { login: jest.fn() },
}));
jest.mock('@/lib/api/administration/authorization.api', () => ({
  administrationAuthorizationApi: { effective: jest.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AdministrationSessionProvider>{children}</AdministrationSessionProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  setRealmAccessToken('administration', null);
});

function expireSession(): never {
  setRealmAccessToken('administration', null);
  dispatchRealmSessionExpired('administration');
  throw new Error('Session expired');
}

it('keeps the administrator anonymous when restoration expires the session', async () => {
  setRealmAccessToken('administration', 'expired-token');
  jest
    .mocked(administrationAuthorizationApi.effective)
    .mockImplementation(async () => {
      await Promise.resolve();
      return expireSession();
    });

  const { result } = renderHook(useAdministrationSession, { wrapper });

  await waitFor(() => expect(result.current.status).toBe('anonymous'));
  expect(result.current.isAuthenticated).toBe(false);
  expect(result.current.authorizationReady).toBe(false);
});

it('keeps a session available when ACL loading fails without expiring the token', async () => {
  setRealmAccessToken('administration', 'valid-token');
  jest
    .mocked(administrationAuthorizationApi.effective)
    .mockRejectedValue(new Error('Service unavailable'));

  const { result } = renderHook(useAdministrationSession, { wrapper });

  await waitFor(() => expect(result.current.status).toBe('authenticated'));
  expect(result.current.authorizationReady).toBe(false);
  expect(result.current.authorization).toBeNull();
});

it('keeps the administrator anonymous when ACL loading expires a new login', async () => {
  jest.mocked(administrationAuthenticationApi.login).mockResolvedValue({
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  });
  jest
    .mocked(administrationAuthorizationApi.effective)
    .mockImplementation(async () => expireSession());
  const { result } = renderHook(useAdministrationSession, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('anonymous'));

  await act(async () => {
    await result.current.login('admin@example.com', 'password');
  });

  expect(result.current.status).toBe('anonymous');
  expect(result.current.isAuthenticated).toBe(false);
  expect(localStorage.getItem('nexus.administration.access_token')).toBeNull();
});
