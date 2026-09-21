'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  PlatformSelector,
  useAuthorizationPlatform,
} from '@/components/administration/platform-selector';
import { administrationAuthorizationApi } from '@/lib/api/administration/authorization.api';
import type { RiskLevel } from '@/lib/api/administration/types';
export default function PermissionsPage() {
  const t = useTranslations('administration.authorization');
  const { platform, setPlatform } = useAuthorizationPlatform();
  const [q, setQ] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>('');
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
    <section className="app-panel p-5 sm:p-6">
      <PlatformSelector platform={platform} onChange={setPlatform} />
      <h1 className="mt-5 text-2xl font-bold">{t('permissions')}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder={t('searchPermissions')}
          aria-label={t('searchPermissions')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value as RiskLevel | '')}
        >
          <option value="">{t('allRisks')}</option>
          <option value="LOW">{t('riskLow')}</option>
          <option value="MEDIUM">{t('riskMedium')}</option>
          <option value="HIGH">{t('riskHigh')}</option>
          <option value="CRITICAL">{t('riskCritical')}</option>
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
              {p.category ?? t('general')} · {p.resource ?? '—'} ·{' '}
              {p.action ?? '—'}
            </p>
            <p className="mt-1 text-xs">{p.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
