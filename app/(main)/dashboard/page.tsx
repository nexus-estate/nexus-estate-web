'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProviderEntryCard } from '@/components/customer/provider-entry-card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/hooks/use-auth';
export default function DashboardPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const t = useTranslations('customer.dashboard');
  useEffect(() => {
    if (status === 'anonymous') router.replace('/signin');
  }, [router, status]);
  if (status === 'restoring' || status === 'anonymous')
    return <LoadingState label={t('loading')} className="min-h-[50vh]" />;
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-[var(--border-muted)] pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          {t('welcome')}, {user?.email}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          {t('welcomeSub')}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel p-5">
          <p className="label-caps">{t('accountTitle')}</p>
          <p className="mt-2 text-base font-semibold text-[var(--text)]">
            {user?.email}
          </p>
          <div className="mt-2">
            <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
              {user?.isEmailVerified ? t('verified') : t('unverified')}
            </Badge>
          </div>
          <Link href="/profile" className="btn btn-secondary mt-4">
            {t('openAccount')}
          </Link>
        </section>
        <ProviderEntryCard />
      </div>
    </div>
  );
}
