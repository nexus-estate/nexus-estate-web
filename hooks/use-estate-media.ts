'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api/media/media.api';

export function useEstateMedia(estateId: string) {
  return useQuery({
    queryKey: ['marketplace', 'estate-media', estateId],
    queryFn: () => mediaApi.listPublic(estateId),
    enabled: Boolean(estateId),
    staleTime: 60_000,
  });
}
