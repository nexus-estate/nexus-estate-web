'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
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
    return <div className="p-8">{t('loading')}</div>;
  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="max-w-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {profile.isLoading && <p>{t('loading')}</p>}
        {profile.error && (
          <p className="text-sm text-red-700">{profile.error.message}</p>
        )}
        {profile.data && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--text-muted)]">{t('email')}</dt>
              <dd className="mt-1 font-medium">{profile.data.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">
                {t('emailStatus')}
              </dt>
              <dd className="mt-1 font-medium">
                {profile.data.isEmailVerified ? t('verified') : t('unverified')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">
                {t('lastLogin')}
              </dt>
              <dd className="mt-1 font-medium">
                {profile.data.lastLogin
                  ? new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(profile.data.lastLogin))
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">
                {t('customerId')}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {profile.data.id}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </>
  );
}
