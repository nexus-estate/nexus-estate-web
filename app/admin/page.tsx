'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { Panel } from '@/components/ui/Panel';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
export default function AdminPage() {
  const { authorization, hasPermission, logout } = useAdministrationSession();
  const t = useTranslations('administration');
  return (
    <div>
      <PageHeader
        title={t('overview.title')}
        description={t('overview.description')}
        actions={
          <button
            className="rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
            onClick={() => void logout()}
          >
            {t('nav.signOut')}
          </button>
        }
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <h2 className="font-semibold">{t('authorization.title')}</h2>
          <p className="mt-2 text-3xl font-bold text-[var(--brand)]">
            {authorization?.permissions.length ?? 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {t('authorization.permissions')}
          </p>
        </Panel>
        {hasPermission('authorization:role:read') && (
          <Link
            href="/admin/authorization"
            className="rounded-[var(--radius-lg)] bg-[var(--brand)] p-6 text-white shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-semibold">{t('authorization.title')}</h2>
            <p className="mt-2 text-sm text-white/70">
              {t('authorization.description')}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
