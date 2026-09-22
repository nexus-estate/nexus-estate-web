import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import { ApiError } from '@/lib/api/core/error';
import { listingApi } from '@/lib/api/listing/listing.api';
import { useProviderContext } from '../context/provider-context.provider';
import { providerKeys } from '../query-keys';
import { useArchiveProviderListing } from './provider-supply.queries';

jest.mock('@/lib/api/estate/estate.api', () => ({
  estateApi: {},
}));
jest.mock('@/lib/api/listing/listing.api', () => ({
  listingApi: {
    archive: jest.fn(),
  },
}));
jest.mock('../context/provider-context.provider', () => ({
  useProviderContext: jest.fn(),
}));

test('refreshes effective provider authorization after a supply 403', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.archive)
    .mockRejectedValue(new ApiError('Forbidden', { status: 403 }));
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

  const { result } = renderHook(() => useArchiveProviderListing(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  await act(async () => {
    await expect(result.current.mutateAsync('listing-1')).rejects.toThrow(
      'Forbidden',
    );
  });

  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: providerKeys.authorization('provider-1'),
  });
});
