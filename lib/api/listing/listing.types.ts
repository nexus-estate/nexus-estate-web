import type { EstatePurpose, EstateType } from '../estate/estate.types';

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ListingEstate {
  id: string;
  title: string;
  description: string | null;
  type: EstateType;
  purpose: EstatePurpose;
  price: number;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  addressLine: string;
  provinceId: string;
  wardId: string;
  latitude: number | null;
  longitude: number | null;
  province: { id: string; code: string; name: string };
  ward: { id: string; code: string; name: string };
}

export interface Listing {
  id: string;
  estateId: string;
  providerId: string;
  status: ListingStatus;
  publishedAt: string | null;
  estate: ListingEstate;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingInput {
  estateId: string;
}

export interface ListingQuery {
  q?: string;
  type?: EstateType;
  purpose?: EstatePurpose;
  provinceId?: string;
  wardId?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export interface ListingPageResponse {
  items: Listing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
