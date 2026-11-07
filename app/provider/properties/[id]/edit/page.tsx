'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PropertyEditor } from '@/components/provider/property/property-editor';
import { Button } from '@/components/ui/Button';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderContext } from '@/features/provider/context/provider-context.provider';
import { useProviderProperty } from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';

export default function EditProviderPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { providerId } = useProviderContext();
  const workspace = useProviderAuthorization();
  const t = useTranslations('provider');
  const canUpdate = workspace.hasProviderPermission('property:update');
  const property = useProviderProperty(id, canUpdate);
  if (workspace.state === 'LOADING' || (canUpdate && property.isLoading))
    return (
      <div role="status" aria-label={t('loading')} className="skeleton h-96" />
    );
  if (workspace.state !== 'ACTIVE_VERIFIED')
    return (
      <p role="alert">{t(`lifecycle.${workspace.state.toLowerCase()}`)}</p>
    );
  if (!canUpdate) return <p role="alert">{t('permissionDenied')}</p>;
  if (property.isError || !property.data)
    return (
      <div role="alert" className="space-y-4">
        <p>
          {property.error instanceof ApiError && property.error.status === 403
            ? t('permissionDenied')
            : t('properties.loadFailed')}
        </p>
        <Button variant="outline" onClick={() => void property.refetch()}>
          {t('controls.refresh')}
        </Button>
      </div>
    );
  return <PropertyEditor key={`${providerId}:${id}`} estate={property.data} />;
}
