'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProviderEntryCard } from '@/components/customer/provider-entry-card';
import { useAuth } from '@/hooks/use-auth';
export default function DashboardPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const t = useTranslations('customer.dashboard');
  useEffect(() => {
    if (status === 'anonymous') router.replace('/signin');
  }, [router, status]);
  if (status === 'restoring' || status === 'anonymous')
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        {t('loading')}
      </div>
    );
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-semibold text-[var(--text)]">
        {t('welcome')}, {user?.email}
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{t('welcomeSub')}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('accountTitle')}
          </p>
          <p className="mt-2 text-lg font-medium">{user?.email}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {user?.isEmailVerified ? t('verified') : t('unverified')}
          </p>
          <a
            className="mt-5 inline-flex text-sm font-medium text-[var(--primary)]"
            href="/profile"
          >
            {t('openAccount')}
          </a>
        </section>
        <ProviderEntryCard />
      </div>
    </div>
  );
}
