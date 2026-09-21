'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estateApi } from '@/lib/api/estate/estate.api';
import type {
  CreateEstateRequest,
  Estate,
} from '@/lib/api/estate/estate.types';

interface UsePropertiesReturn {
  properties: Estate[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface UsePropertyReturn {
  property: Estate | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface UseCreatePropertyReturn {
  createProperty: (data: CreateEstateRequest) => Promise<Estate>;
  isPending: boolean;
  error: Error | null;
}

async function fetchProperties(): Promise<Estate[]> {
  return estateApi.listMine();
}

async function fetchProperty(id: string): Promise<Estate> {
  return estateApi.getById(id);
}

async function createProperty(data: CreateEstateRequest): Promise<Estate> {
  return estateApi.create(data);
}

export function useProperties(): UsePropertiesReturn {
  const { data, isLoading, error } = useQuery<Estate[], Error>({
    queryKey: ['estates', 'mine'],
    queryFn: fetchProperties,
  });

  return { properties: data, isLoading, error };
}

export function useProperty(id: string): UsePropertyReturn {
  const { data, isLoading, error } = useQuery<Estate, Error>({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });

  return { property: data, isLoading, error };
}

export function useCreateProperty(): UseCreatePropertyReturn {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Estate,
    Error,
    CreateEstateRequest
  >({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estates'] });
    },
  });

  return { createProperty: mutateAsync, isPending, error };
}
