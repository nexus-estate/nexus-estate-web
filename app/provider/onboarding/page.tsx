'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { providerApi } from '@/lib/api/provider/provider.api';
export default function ProviderOnboardingPage() {
  const t = useTranslations('provider.onboarding');
  const router = useRouter();
  const [type, setType] = useState('INDIVIDUAL');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <form
        className="max-w-xl border border-[var(--border)] bg-[var(--surface)] p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError('');
          try {
            await providerApi.registerFromCustomer({ type, displayName });
            router.push('/provider');
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Unable to submit onboarding.',
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium">{t('type')}</span>
          <select
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </select>
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium">{t('displayName')}</span>
          <input
            className="w-full rounded-md border border-[var(--border)] px-3 py-2"
            required
            maxLength={255}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <button
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={saving}
        >
          {saving ? t('submitting') : t('submit')}
        </button>
      </form>
    </>
  );
}
