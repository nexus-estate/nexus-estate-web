'use client';
import { useQuery } from '@tanstack/react-query';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function PermissionsPage() {
  const { platform, setPlatform } = useAuthorizationPlatform();
  const query = useQuery({
    queryKey: ['administration', 'authorization', platform, 'permissions'],
    queryFn: () => administrationAuthorizationApi.permissions(platform),
  });
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <PlatformSelector platform={platform} onChange={setPlatform} />
      <h1 className="text-2xl font-bold">Permission catalogue</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(query.data?.items ?? []).map((p) => (
          <article className="rounded border p-4" key={p.id}>
            <b>{p.code}</b>
            <p className="text-sm text-gray-500">
              {p.category} · {p.resource} · {p.action}
            </p>
            <p className="mt-1 text-xs">{p.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
