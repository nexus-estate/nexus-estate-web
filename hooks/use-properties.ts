'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '@/lib/api/property/property.api';
import type {
  CreatePropertyInput,
  Property,
  PropertyFilters,
} from '@/lib/api/property/property.types';

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

interface UseCreatePropertyReturn {
  createProperty: (data: CreatePropertyInput) => Promise<Property>;
  isPending: boolean;
  error: Error | null;
}

async function fetchProperties(filters: PropertyFilters): Promise<Property[]> {
  const response = await propertyApi.list(filters);
  if (Array.isArray(response)) return response;
  return response.data ?? response.properties ?? response.items ?? [];
}

async function fetchProperty(id: string): Promise<Property> {
  return propertyApi.getById(id);
}

async function createProperty(data: CreatePropertyInput): Promise<Property> {
  return propertyApi.create(data);
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
