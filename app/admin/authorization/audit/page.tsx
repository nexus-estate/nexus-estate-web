'use client';
import { useQuery } from '@tanstack/react-query';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function AuditPage() {
  const query = useQuery({
    queryKey: ['administration', 'authorization', 'audit'],
    queryFn: () => administrationAuthorizationApi.audit(),
  });
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Authorization audit</h1>
      <pre className="mt-6 overflow-auto rounded bg-gray-950 p-4 text-xs text-green-200">
        {JSON.stringify(query.data ?? [], null, 2)}
      </pre>
    </section>
  );
}
