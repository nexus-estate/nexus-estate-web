'use client';
import { useQuery } from '@tanstack/react-query';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { Platform } from '@/lib/api/administration/types';
export default function MatrixPage() {
  const platform: Platform = 'MARKETPLACE';
  const query = useQuery({
    queryKey: ['administration', 'authorization', platform, 'matrix'],
    queryFn: () => administrationAuthorizationApi.matrix(platform),
  });
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Permission matrix</h1>
      <p className="mt-2 text-sm text-gray-500">
        The API owns role and permission ordering; replacements are atomic.
      </p>
      <pre className="mt-6 overflow-auto rounded bg-gray-950 p-4 text-xs text-green-200">
        {JSON.stringify(query.data ?? {}, null, 2)}
      </pre>
    </section>
  );
}
