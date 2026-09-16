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

export interface Estate {
  id: string;
  customerId: string;
  providerId: string | null;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
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
