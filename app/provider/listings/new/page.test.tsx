import { fireEvent, render, screen } from '@testing-library/react';

import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import {
  useCreateProviderListing,
  useListingEligibleProperties,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import NewProviderListingPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams('estateId=estate-1'),
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('@/components/portal/page-header', () => ({
  PageHeader: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));
jest.mock('@/features/provider/context/provider-context.hooks', () => ({
  useProviderAuthorization: jest.fn(),
}));
jest.mock('@/features/provider/supply/provider-supply.queries', () => ({
  useCreateProviderListing: jest.fn(),
  useListingEligibleProperties: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProviderAuthorization).mockReturnValue({
    state: 'ACTIVE_VERIFIED',
    hasProviderPermission: () => true,
  } as never);
  jest.mocked(useCreateProviderListing).mockReturnValue({
    isPending: false,
    isError: false,
  } as never);
});

test('renders permission denied when eligible-properties is forbidden', () => {
  jest.mocked(useListingEligibleProperties).mockReturnValue({
    isLoading: false,
    isError: true,
    error: new ApiError('Forbidden', { status: 403 }),
    data: undefined,
  } as never);

  render(<NewProviderListingPage />);

  expect(screen.getByRole('alert')).toHaveTextContent('permissionDenied');
  expect(screen.getByRole('alert')).not.toHaveTextContent(
    'listings.loadFailed',
  );
});

test('preselects only an eligible estate from the URL', () => {
  jest.mocked(useListingEligibleProperties).mockReturnValue({
    isLoading: false,
    isError: false,
    data: [{ id: 'estate-1', title: 'Estate one' }],
  } as never);
  const { unmount } = render(<NewProviderListingPage />);
  expect(screen.getByRole('combobox')).toHaveValue('estate-1');
  expect(
    screen.getByRole('button', { name: 'listings.createDraft' }),
  ).toBeEnabled();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
  expect(
    screen.getByRole('button', { name: 'listings.createDraft' }),
  ).toBeDisabled();
  unmount();
  jest.mocked(useListingEligibleProperties).mockReturnValue({
    isLoading: false,
    isError: false,
    data: [{ id: 'estate-2', title: 'Estate two' }],
  } as never);
  render(<NewProviderListingPage />);
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(
    screen.getByRole('button', { name: 'listings.createDraft' }),
  ).toBeDisabled();
});
