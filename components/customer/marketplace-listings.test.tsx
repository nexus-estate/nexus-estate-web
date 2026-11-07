import { redirect } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EstateDetailPage from '@/app/(main)/properties/estate/[id]/page';
import PropertiesPage from '@/app/(main)/properties/page';
import { estateApi } from '@/lib/api/estate/estate.api';
import { listingApi } from '@/lib/api/listing/listing.api';
import type {
  Listing,
  ListingPageResponse,
} from '@/lib/api/listing/listing.types';
import { MarketplaceHome } from './marketplace-home';
import { PropertyDetailLayout } from './property-detail/property-detail-layout';

jest.mock('next-intl', () => ({
  useLocale: () => 'vi',
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));
jest.mock('@/hooks/use-locations', () => ({
  useLocations: () => ({ provinces: [], wards: [], wardsPending: false }),
}));
jest.mock('@/lib/api/estate/estate.api', () => ({
  estateApi: { listPublic: jest.fn(), getById: jest.fn() },
}));
jest.mock('@/lib/api/listing/listing.api', () => ({
  listingApi: { list: jest.fn(), promoted: jest.fn() },
}));
jest.mock('./estate-image', () => ({ EstateImage: () => null }));
jest.mock('./property-gallery', () => ({ PropertyGallery: () => null }));
jest.mock('./property-detail/property-contact-card', () => ({
  PropertyContactCard: () => null,
}));
jest.mock('./property-detail/property-information', () => ({
  PropertySummary: () => null,
  PropertyInformation: () => null,
}));

const published: Listing = {
  id: 'published-listing',
  estateId: 'listed-estate',
  providerId: 'provider',
  status: 'PUBLISHED',
  publishedAt: '2026-11-07T00:00:00Z',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-11-07T00:00:00Z',
  estate: {
    id: 'listed-estate',
    title: 'Published property',
    description: null,
    type: 'HOUSE',
    purpose: 'SALE',
    price: 1000000,
    area: 100,
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    addressLine: 'Street',
    provinceId: 'province',
    wardId: 'ward',
    latitude: null,
    longitude: null,
    province: { id: 'province', code: '01', name: 'City' },
    ward: { id: 'ward', code: '001', name: 'Ward' },
  },
};
function page(items: Listing[], total = items.length): ListingPageResponse {
  return {
    items,
    meta: {
      total,
      page: 1,
      limit: 12,
      totalPages: Math.ceil(total / 12),
      hasNextPage: total > 12,
      hasPreviousPage: false,
    },
  };
}
function show(element: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>,
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  // An active estate exists independently of whether it has a published listing.
  jest.mocked(estateApi.listPublic).mockResolvedValue([
    {
      ...published.estate,
      id: 'active-unlisted',
      title: 'Active without listing',
      status: 'ACTIVE',
    } as Awaited<ReturnType<typeof estateApi.listPublic>>[number],
  ]);
  jest.mocked(listingApi.list).mockResolvedValue(page([published]));
  jest.mocked(listingApi.promoted).mockResolvedValue([]);
});

test.each(['home', 'browse', 'similar'] as const)(
  '%s displays public listing links and never fetches active estate inventory',
  async (surface) => {
    show(
      surface === 'home' ? (
        <MarketplaceHome />
      ) : surface === 'browse' ? (
        <PropertiesPage />
      ) : (
        <PropertyDetailLayout
          property={{ ...published.estate, id: 'current-estate' }}
          listingId="current-listing"
          price="1 VND"
        />
      ),
    );
    const link = await screen.findByRole('link', {
      name: /Published property/,
    });
    expect(link).toHaveAttribute('href', '/properties/published-listing');
    expect(
      screen.queryByText('Active without listing'),
    ).not.toBeInTheDocument();
    expect(estateApi.listPublic).not.toHaveBeenCalled();
  },
);

test.each(['home', 'browse'] as const)(
  '%s stays empty when active estates have no public listings',
  async (surface) => {
    jest.mocked(listingApi.list).mockResolvedValue(page([]));
    show(surface === 'home' ? <MarketplaceHome /> : <PropertiesPage />);
    expect(
      await screen.findByText(
        surface === 'home' ? 'home.empty' : 'properties.empty',
      ),
    ).toBeVisible();
    expect(
      screen.queryByText('Active without listing'),
    ).not.toBeInTheDocument();
    expect(estateApi.listPublic).not.toHaveBeenCalled();
  },
);

test('home requests the latest eight listings in publication order', async () => {
  show(<MarketplaceHome />);
  await screen.findByRole('link', { name: /Published property/ });
  expect(listingApi.list).toHaveBeenCalledWith({ sort: 'newest', limit: 8 });
});

test('browse uses server totals and sends pagination, search and sorting to listings', async () => {
  jest.mocked(listingApi.list).mockResolvedValue(page([published], 25));
  show(<PropertiesPage />);
  await screen.findByText('properties.results {"count":25}');
  fireEvent.click(screen.getByRole('button', { name: 'properties.next' }));
  await waitFor(() =>
    expect(listingApi.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, limit: 12, sort: 'newest' }),
    ),
  );
  fireEvent.change(screen.getByRole('searchbox'), {
    target: { value: 'Villa' },
  });
  await waitFor(() =>
    expect(listingApi.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, q: 'Villa' }),
    ),
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'properties.sort' }), {
    target: { value: 'price_asc' },
  });
  await waitFor(() =>
    expect(listingApi.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, q: 'Villa', sort: 'price_asc' }),
    ),
  );
});

test('similar listings exclude the current estate', async () => {
  show(
    <PropertyDetailLayout
      property={published.estate}
      listingId={published.id}
      price="1 VND"
    />,
  );
  await waitFor(() => expect(listingApi.list).toHaveBeenCalled());
  expect(
    screen.queryByRole('link', { name: /Published property/ }),
  ).not.toBeInTheDocument();
});

test('legacy estate detail route cannot expose an unlisted estate', () => {
  EstateDetailPage();
  expect(redirect).toHaveBeenCalledWith('/properties');
  expect(estateApi.getById).not.toHaveBeenCalled();
});
