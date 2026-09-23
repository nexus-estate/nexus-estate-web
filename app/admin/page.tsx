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
          <button className="btn btn-secondary" onClick={() => void logout()}>
            {t('nav.signOut')}
          </button>
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            {t('authorization.title')}
          </h2>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
            {authorization?.permissions.length ?? 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {t('authorization.permissions')}
          </p>
        </Panel>
        {hasPermission('authorization:role:read') && (
          <Link
            href="/admin/authorization"
            className="panel group p-5 transition-[border-color,box-shadow] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]"
          >
            <h2 className="text-sm font-semibold text-[var(--text)]">
              {t('authorization.title')}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              {t('authorization.description')}
            </p>
            <span className="link mt-4 inline-flex text-sm">
              {t('nav.roles')} →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
