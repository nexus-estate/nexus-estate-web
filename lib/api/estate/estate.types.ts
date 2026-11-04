export type EstateType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'TOWNHOUSE'
  | 'LAND'
  | 'OFFICE'
  | 'SHOPHOUSE'
  | 'WAREHOUSE'
  | 'COMMERCIAL'
  | 'HOTEL'
  | 'RESORT'
  | 'FARM'
  | 'OTHER';

export type EstatePurpose = 'SALE' | 'RENT' | 'SALE_OR_RENT';

export type EstateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

/** Location reference embedded in the Estate response contract. */
export interface EstateLocation {
  id: string;
  code: string;
  name: string;
}

/**
 * Wire contract of the Estate endpoints (API `EstateResponse`).
 *
 * Provider is the canonical owner. Province and ward are NOT NULL relations,
 * always hydrated by the API. The legacy customer ownership field and internal
 * fields (`deletedAt`, `createdBy`, `updatedBy`) are never exposed.
 */
export interface Estate {
  id: string;
  providerId: string;
  status: EstateStatus;
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
  province: EstateLocation;
  ward: EstateLocation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstateRequest {
  title: string;
  description?: string;
  type: EstateType;
  purpose: EstatePurpose;
  price: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  addressLine: string;
  provinceId: string;
  wardId: string;
  latitude?: number;
  longitude?: number;
}

export type UpdateEstateRequest = Partial<CreateEstateRequest>;

export interface Province {
  id: string;
  code: string;
  type: string;
  name: string;
}

export interface Ward {
  id: string;
  code: string;
  name: string;
  type: string;
  provinceId: string;
}
