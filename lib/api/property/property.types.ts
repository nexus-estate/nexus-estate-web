export interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  purpose: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  address?: string;
  city: string;
  district: string;
  description?: string;
  images?: string[];
  brokerId?: string;
  status?: string;
  broker?: {
    fullName?: string;
    phone?: string;
  };
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  type?: string;
  purpose?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  status?: string;
  search?: string;
  q?: string;
  sort?: string;
}

export interface CreatePropertyInput {
  title: string;
  type: string;
  purpose: string;
  price: number;
  area: number;
  address: string;
  city: string;
  district: string;
  description?: string;
  images?: string[];
}

export interface PropertyListResponse {
  data?: Property[];
  properties?: Property[];
  items?: Property[];
  total?: number;
}
