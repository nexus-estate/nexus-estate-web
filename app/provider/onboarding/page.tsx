'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/portal/page-header';
import { useProviderContext } from '@/features/provider/context/provider-context.provider';
import { providerApi } from '@/lib/api/provider/provider.api';
import type { ProviderAccount } from '@/lib/api/provider/types';
import { FEEDBACK, notify } from '@/lib/notify';
export default function ProviderOnboardingPage() {
  const t = useTranslations('provider.onboarding');
  const providerT = useTranslations('provider');
  const commonT = useTranslations('common');
  const router = useRouter();
  const [type, setType] = useState<ProviderAccount['type']>('INDIVIDUAL');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { setProviderId } = useProviderContext();
  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <form
        className="panel max-w-xl space-y-4 p-5 sm:p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError('');
          try {
            const result = await providerApi.registerFromCustomer({
              type,
              displayName: displayName.trim(),
            });
            if (result.providerAccount.id)
              setProviderId(result.providerAccount.id);
            await queryClient.invalidateQueries({
              queryKey: ['provider-workspace'],
            });
            notify.success(commonT(FEEDBACK.created));
            router.push('/provider');
          } catch (cause) {
            const message = cause instanceof Error ? cause.message : t('error');
            setError(message);
            notify.error(message);
          } finally {
            setSaving(false);
          }
        }}
      >
        <div>
          <label className="field-label" htmlFor="provider-type">
            {t('type')}
          </label>
          <select
            id="provider-type"
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value as ProviderAccount['type'])}
          >
            <option value="INDIVIDUAL">{providerT('types.INDIVIDUAL')}</option>
            <option value="BROKER">{providerT('types.BROKER')}</option>
            <option value="AGENCY">{providerT('types.AGENCY')}</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="provider-name">
            {t('displayName')}
          </label>
          <input
            id="provider-name"
            className="field"
            required
            maxLength={255}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? t('submitting') : t('submit')}
        </button>
      </form>
    </>
  );
}
