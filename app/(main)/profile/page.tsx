'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/hooks/use-auth';
import { customerAccountApi } from '@/lib/api/customer/account.api';
export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations('customer.account');
  const profile = useQuery({
    queryKey: ['customer', 'me'],
    queryFn: customerAccountApi.me,
    enabled: isAuthenticated,
  });
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/signin');
  }, [isAuthenticated, isLoading, router]);
  if (isLoading || !isAuthenticated)
    return <LoadingState label={t('loading')} className="min-h-[40vh]" />;
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title={t('title')} description={t('description')} />
      <div className="panel max-w-2xl p-5">
        {profile.isLoading && <p className="text-sm">{t('loading')}</p>}
        {profile.error && (
          <p role="alert" className="text-sm text-[var(--danger)]">
            {profile.error.message}
          </p>
        )}
        {profile.data && (
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="label-caps">{t('email')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">
                {profile.data.email}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('emailStatus')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">
                {profile.data.isEmailVerified ? t('verified') : t('unverified')}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('lastLogin')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">
                {profile.data.lastLogin
                  ? new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(profile.data.lastLogin))
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="label-caps">{t('customerId')}</dt>
              <dd className="mt-1 break-all font-mono text-xs text-[var(--text-muted)]">
                {profile.data.id}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
