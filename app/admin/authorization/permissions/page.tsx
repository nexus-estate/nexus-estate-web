'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
export default function PermissionsPage() {
  const { platform, setPlatform } = useAuthorizationPlatform();
  const [q, setQ] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const query = useQuery({
    queryKey: [
      'administration',
      'authorization',
      platform,
      'permissions',
      { q, riskLevel },
    ],
    queryFn: () =>
      administrationAuthorizationApi.permissions(platform, {
        q: q || undefined,
        riskLevel: riskLevel || undefined,
      }),
  });
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <PlatformSelector platform={platform} onChange={setPlatform} />
      <h1 className="text-2xl font-bold">Permission catalogue</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Search permissions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
        >
          <option value="">All risks</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(query.data?.items ?? []).map((p) => (
          <article className="rounded border p-4" key={p.id}>
            <Link
              className="font-medium hover:underline"
              href={`/admin/authorization/permissions/${p.id}?platform=${platform}`}
            >
              {p.name}
            </Link>
            <code className="mt-1 block text-xs text-gray-500">{p.code}</code>
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
