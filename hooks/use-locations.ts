'use client';

import { useQuery } from '@tanstack/react-query';
import { locationApi } from '@/lib/api/estate/estate.api';

export function useLocations(provinceId: string) {
  const provinces = useQuery({
    queryKey: ['locations', 'provinces'],
    queryFn: locationApi.provinces,
  });
  const wards = useQuery({
    queryKey: ['locations', 'wards', provinceId],
    queryFn: () => locationApi.wards(provinceId),
    enabled: Boolean(provinceId),
  });

  return {
    provinces: provinces.data ?? [],
    wards: provinceId ? (wards.data ?? []) : [],
    wardsPending: wards.isPending,
  };
}
