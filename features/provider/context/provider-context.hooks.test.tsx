import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { providerApi } from '@/lib/api/provider/provider.api';
import { providerKeys } from '../query-keys';
import { useProviderAuthorization } from './provider-context.hooks';
import { useProviderContext } from './provider-context.provider';

jest.mock('@/lib/api/provider/provider.api', () => ({
  providerApi: { authorization: jest.fn() },
}));
jest.mock('./provider-context.provider', () => ({
  useProviderContext: jest.fn(),
}));

const authorization = {
  platform: 'PROVIDER' as const,
  providerId: 'provider-1',
  membershipId: 'membership-1',
  roles: [],
  permissions: [],
  providerStatus: 'ACTIVE' as const,
  verificationStatus: 'VERIFIED' as const,
  membershipStatus: 'ACTIVE' as const,
  authorizationVersion: '1',
};

test('resolves an authorization-only active provider as mutable', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest.mocked(providerApi.authorization).mockResolvedValue(authorization);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const { result } = renderHook(() => useProviderAuthorization(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.state).toBe('ACTIVE_VERIFIED'));
  expect(result.current.canMutate).toBe(true);
  expect(
    queryClient.getQueryData(providerKeys.authorization('provider-1')),
  ).toEqual(authorization);
});
