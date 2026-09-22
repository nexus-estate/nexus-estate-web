import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { ApiError } from '@/lib/api/core/error';
import { estateApi } from '@/lib/api/estate/estate.api';
import { listingApi } from '@/lib/api/listing/listing.api';
import { useProviderContext } from '../context/provider-context.provider';
import { providerKeys } from '../query-keys';
import {
  useActivateProviderProperty,
  useArchiveProviderProperty,
  useArchiveProviderListing,
  useCreateProviderListing,
  useCreateProviderProperty,
  useListingEligibleProperties,
  useRestoreProviderProperty,
  useUpdateProviderProperty,
} from './provider-supply.queries';

jest.mock('@/lib/api/estate/estate.api', () => ({
  estateApi: {
    create: jest.fn(),
    update: jest.fn(),
    activate: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock('@/lib/api/listing/listing.api', () => ({
  listingApi: {
    archive: jest.fn(),
    create: jest.fn(),
    eligibleProperties: jest.fn(),
  },
}));
jest.mock('../context/provider-context.provider', () => ({
  useProviderContext: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

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

test('loads eligible properties with listing:create as the only capability', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.eligibleProperties)
    .mockResolvedValue([{ id: 'property-1', title: 'Riverside apartment' }]);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const { result } = renderHook(() => useListingEligibleProperties(true), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  await act(async () => {
    await expect(result.current.refetch()).resolves.toMatchObject({
      data: [{ id: 'property-1' }],
    });
  });
  expect(listingApi.eligibleProperties).toHaveBeenCalledTimes(1);
});

test('refreshes authorization when eligible properties return 403', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  jest
    .mocked(listingApi.eligibleProperties)
    .mockRejectedValue(new ApiError('Forbidden', { status: 403 }));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

  const { result } = renderHook(() => useListingEligibleProperties(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  let refetchResult: Awaited<ReturnType<typeof result.current.refetch>>;
  await act(async () => {
    refetchResult = await result.current.refetch();
  });

  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: providerKeys.authorization('provider-1'),
  });
  await waitFor(() => {
    expect(refetchResult.error).toMatchObject({ status: 403 });
  });
});

test.each([
  [
    'create property',
    useCreateProviderProperty,
    () => {
      jest.mocked(estateApi.create).mockResolvedValue({} as never);
      return { data: { title: 'New property' } };
    },
  ],
  [
    'update property',
    useUpdateProviderProperty,
    () => {
      jest
        .mocked(estateApi.update)
        .mockResolvedValue({ id: 'property-1' } as never);
      return {
        data: { id: 'property-1', data: { title: 'Updated property' } },
      };
    },
  ],
  [
    'archive property',
    useArchiveProviderProperty,
    () => {
      jest
        .mocked(estateApi.archive)
        .mockResolvedValue({ id: 'property-1' } as never);
      return { data: 'property-1' };
    },
  ],
  [
    'activate property',
    useActivateProviderProperty,
    () => {
      jest
        .mocked(estateApi.activate)
        .mockResolvedValue({ id: 'property-1' } as never);
      return { data: 'property-1' };
    },
  ],
  [
    'restore property',
    useRestoreProviderProperty,
    () => {
      jest
        .mocked(estateApi.restore)
        .mockResolvedValue({ id: 'property-1' } as never);
      return { data: 'property-1' };
    },
  ],
  [
    'create listing',
    useCreateProviderListing,
    () => {
      jest.mocked(listingApi.create).mockResolvedValue({} as never);
      return { data: { estateId: 'property-1' } };
    },
  ],
])(
  '%s invalidates eligible properties after success',
  async (_name, hook, setup) => {
    jest.mocked(useProviderContext).mockReturnValue({
      providerId: 'provider-1',
      setProviderId: jest.fn(),
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { data, ...mutationOptions } = setup();
    const { result } = renderHook(() => hook(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync(data as never);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: providerKeys.eligibleProperties('provider-1'),
    });
    void mutationOptions;
  },
);

test('does not query eligible properties when listing:create is absent', async () => {
  jest.mocked(useProviderContext).mockReturnValue({
    providerId: 'provider-1',
    setProviderId: jest.fn(),
  });
  const queryClient = new QueryClient();

  renderHook(() => useListingEligibleProperties(false), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  expect(listingApi.eligibleProperties).not.toHaveBeenCalled();
});
