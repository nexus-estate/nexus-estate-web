'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Property, ApiResponse } from '@/lib/sdk';

interface PropertyFilters {
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
  status?: string;
  search?: string;
}

interface UsePropertiesReturn {
  properties: Property[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface UsePropertyReturn {
  property: Property | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface CreatePropertyInput {
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

interface UseCreatePropertyReturn {
  createProperty: (data: CreatePropertyInput) => Promise<Property>;
  isPending: boolean;
  error: Error | null;
}

function buildQueryString(filters: PropertyFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchProperties(filters: PropertyFilters): Promise<Property[]> {
  const qs = buildQueryString(filters);
  const response: ApiResponse<Property[]> = await apiClient.get<Property[]>(
    `/properties${qs}`,
  );
  return response.data;
}

async function fetchProperty(id: string): Promise<Property> {
  const response: ApiResponse<Property> = await apiClient.get<Property>(
    `/properties/${id}`,
  );
  return response.data;
}

async function createProperty(data: CreatePropertyInput): Promise<Property> {
  const response: ApiResponse<Property> = await apiClient.post<Property>(
    '/properties',
    data,
  );
  return response.data;
}

export function useProperties(
  filters: PropertyFilters = {},
): UsePropertiesReturn {
  const { data, isLoading, error } = useQuery<Property[], Error>({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
  });

  return { properties: data, isLoading, error };
}

export function useProperty(id: string): UsePropertyReturn {
  const { data, isLoading, error } = useQuery<Property, Error>({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });

  return { property: data, isLoading, error };
}

export function useCreateProperty(): UseCreatePropertyReturn {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Property,
    Error,
    CreatePropertyInput
  >({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  return { createProperty: mutateAsync, isPending, error };
}
