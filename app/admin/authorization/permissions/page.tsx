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
    <section className="panel p-5 sm:p-6">
      <PlatformSelector platform={platform} onChange={setPlatform} />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {t('permissions')}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="field w-full sm:max-w-sm"
          placeholder={t('searchPermissions')}
          aria-label={t('searchPermissions')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="field w-auto min-w-40"
          aria-label={t('risk')}
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
          <article className="panel-flush p-4" key={p.id}>
            <Link
              className="link"
              href={`/admin/authorization/permissions/${p.id}?platform=${platform}`}
            >
              {p.name}
            </Link>
            <code className="mt-1 block font-mono text-xs text-[var(--text-muted)]">
              {p.code}
            </code>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {p.category ?? t('general')} · {p.resource ?? '—'} ·{' '}
              {p.action ?? '—'}
            </p>
            {p.description && (
              <p className="mt-2 text-sm leading-6 text-[var(--text)]">
                {p.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
