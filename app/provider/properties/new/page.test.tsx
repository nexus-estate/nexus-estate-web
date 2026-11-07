import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useCreateProviderProperty } from '@/features/provider/supply/provider-supply.queries';
import NewProviderPropertyPage from './page';

const push = jest.fn();
const mutateAsync = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'vi',
}));
jest.mock('@/features/provider/context/provider-context.hooks', () => ({
  useProviderAuthorization: jest.fn(),
}));
jest.mock('@/features/provider/supply/provider-supply.queries', () => ({
  useCreateProviderProperty: jest.fn(),
  useUpdateProviderProperty: () => ({ isPending: false, isError: false }),
  useProviderEstateMedia: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@/hooks/use-locations', () => ({
  useLocations: () => ({
    provinces: [{ id: 'p1', name: 'Province' }],
    wards: [{ id: 'w1', name: 'Ward' }],
    wardsPending: false,
  }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProviderAuthorization).mockReturnValue({
    state: 'ACTIVE_VERIFIED',
    hasProviderPermission: () => true,
  } as never);
  jest.mocked(useCreateProviderProperty).mockReturnValue({
    isPending: false,
    isError: false,
    mutateAsync,
  } as never);
});
test('updates the local preview and clears the ward when province changes', () => {
  render(<NewProviderPropertyPage />);
  fireEvent.change(screen.getByLabelText(/properties.editor.labels.title/), {
    target: { value: 'Sun Avenue' },
  });
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    'Sun Avenue',
  );
  fireEvent.change(screen.getByLabelText(/properties.fields.province/), {
    target: { value: 'p1' },
  });
  fireEvent.change(screen.getByLabelText(/properties.editor.ward\s/), {
    target: { value: 'w1' },
  });
  expect(screen.getByText('Ward, Province')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/properties.fields.province/), {
    target: { value: '' },
  });
  expect(screen.getByLabelText(/properties.editor.ward\s/)).toHaveValue('');
  expect(mutateAsync).not.toHaveBeenCalled();
});
test('submits supported enum values and numeric fields through the existing mutation', async () => {
  mutateAsync.mockResolvedValue({ id: 'estate-1' });
  const { container } = render(<NewProviderPropertyPage />);
  for (const [key, value] of Object.entries({
    title: 'Sun Avenue',
    price: '4200000000',
    area: '85.5',
    bedrooms: '2',
    bathrooms: '0',
    addressLine: '28 Mai Chi Tho',
  })) {
    fireEvent.change(
      screen.getByLabelText(new RegExp(`properties.editor.labels.${key}`)),
      { target: { value } },
    );
  }
  fireEvent.change(screen.getByLabelText(/properties.fields.province/), {
    target: { value: 'p1' },
  });
  fireEvent.change(screen.getByLabelText(/properties.editor.ward\s/), {
    target: { value: 'w1' },
  });
  fireEvent.click(screen.getByLabelText('properties.purposes.SALE_OR_RENT'));
  fireEvent.change(screen.getByLabelText('properties.editor.otherTypes'), {
    target: { value: 'OFFICE' },
  });
  fireEvent.submit(container.querySelector('form')!);
  await waitFor(() =>
    expect(push).toHaveBeenCalledWith('/provider/properties'),
  );
  expect(mutateAsync).toHaveBeenCalledWith({
    title: 'Sun Avenue',
    description: undefined,
    type: 'OFFICE',
    purpose: 'SALE_OR_RENT',
    price: 4200000000,
    area: 85.5,
    bedrooms: 2,
    bathrooms: 0,
    addressLine: '28 Mai Chi Tho',
    provinceId: 'p1',
    wardId: 'w1',
  });
});
test('blocks creation without permission', () => {
  jest.mocked(useProviderAuthorization).mockReturnValue({
    state: 'ACTIVE_VERIFIED',
    hasProviderPermission: () => false,
  } as never);
  render(<NewProviderPropertyPage />);
  expect(
    screen.getByRole('button', { name: /properties.create/ }),
  ).toBeDisabled();
});

test('clears the selected unit when switching to commune and submits its wardId', async () => {
  mutateAsync.mockResolvedValue({ id: 'estate-2' });
  const { container } = render(<NewProviderPropertyPage />);
  fireEvent.change(screen.getByLabelText(/properties.fields.province/), {
    target: { value: 'p1' },
  });
  fireEvent.change(screen.getByLabelText(/properties.editor.ward\s/), {
    target: { value: 'w1' },
  });
  fireEvent.change(screen.getByLabelText('properties.editor.unitType'), {
    target: { value: 'commune' },
  });
  expect(screen.getByLabelText(/properties.editor.ward\s/)).toHaveValue('');
  fireEvent.change(screen.getByLabelText(/properties.editor.ward\s/), {
    target: { value: 'w1' },
  });
  fireEvent.submit(container.querySelector('form')!);
  await waitFor(() =>
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ wardId: 'w1', provinceId: 'p1' }),
    ),
  );
  expect(mutateAsync.mock.calls[0][0]).not.toHaveProperty('urbanWardId');
  expect(mutateAsync.mock.calls[0][0]).not.toHaveProperty('communeId');
});
