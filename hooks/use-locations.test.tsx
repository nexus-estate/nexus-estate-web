import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { locationApi } from '@/lib/api/estate/estate.api';
import { useLocations } from './use-locations';

jest.mock('@/lib/api/estate/estate.api', () => ({
  locationApi: { provinces: jest.fn(), wards: jest.fn() },
}));

it('isolates late ward responses and clears wards when the province is cleared', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  jest.mocked(locationApi.provinces).mockResolvedValue([]);
  let resolveFirst!: (value: never[]) => void;
  jest.mocked(locationApi.wards).mockImplementation((id) =>
    id === 'first'
      ? new Promise((resolve) => {
          resolveFirst = resolve;
        })
      : Promise.resolve([
          {
            id: 'second-ward',
            name: 'Second',
            code: '2',
            provinceId: 'second',
            type: 'WARD',
          },
        ]),
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(({ id }) => useLocations(id), {
    initialProps: { id: 'first' },
    wrapper,
  });
  rerender({ id: 'second' });
  await waitFor(() => expect(result.current.wards[0]?.id).toBe('second-ward'));
  await act(async () => {
    resolveFirst([]);
  });
  expect(result.current.wards[0]?.id).toBe('second-ward');
  rerender({ id: '' });
  expect(result.current.wards).toEqual([]);
  expect(locationApi.wards).not.toHaveBeenCalledWith('');
  client.clear();
});
