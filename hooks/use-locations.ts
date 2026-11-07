'use client';

import { useQuery } from '@tanstack/react-query';
import { locationApi } from '@/lib/api/estate/estate.api';
import type { AdministrativeUnitType } from '@/lib/api/estate/estate.types';

export function useLocations(
  provinceId: string,
  unitType?: AdministrativeUnitType,
) {
  const provinces = useQuery({
    queryKey: ['locations', 'provinces'],
    queryFn: locationApi.provinces,
  });
  const wards = useQuery({
    queryKey: ['locations', 'wards', provinceId, unitType ?? 'all'],
    queryFn: () =>
      unitType
        ? locationApi.units(provinceId, unitType)
        : locationApi.wards(provinceId),
    enabled: Boolean(provinceId),
  });

  return {
    provinces: provinces.data ?? [],
    wards: provinceId ? (wards.data ?? []) : [],
    wardsPending: wards.isPending,
  };
}
