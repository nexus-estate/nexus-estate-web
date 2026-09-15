'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';
const fallback: Platform = 'MARKETPLACE';
export function useAuthorizationPlatform() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get('platform');
  const platform: Platform =
    raw === 'PROVIDER' || raw === 'ADMINISTRATION' || raw === 'MARKETPLACE'
      ? raw
      : fallback;
  const setPlatform = (next: Platform) => {
    const nextParams = new URLSearchParams(params.toString());
    nextParams.set('platform', next);
    router.push(`${pathname}?${nextParams}`);
  };
  return { platform, setPlatform };
}
export function PlatformSelector({
  platform,
  onChange,
}: {
  platform: Platform;
  onChange: (platform: Platform) => void;
}) {
  const t = useTranslations('administration.authorization');
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'platforms'],
    queryFn: administrationAuthorizationApi.platforms,
  });
  return (
    <label className="text-sm">
      <span className="mr-2 text-[var(--text-muted)]">{t('platform')}</span>
      <select
        value={platform}
        onChange={(event) => onChange(event.target.value as Platform)}
        className="rounded border bg-white px-3 py-2 text-sm"
      >
        {(query.data?.items ?? []).map((item) => (
          <option key={item.platform} value={item.platform}>
            {item.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
