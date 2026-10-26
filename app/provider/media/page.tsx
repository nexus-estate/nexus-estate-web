'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { EstateMediaUpload } from '@/components/media/estate-media-upload';
import { PageHeader } from '@/components/portal/page-header';
import { Button } from '@/components/ui/Button';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderProperties } from '@/features/provider/supply/provider-supply.queries';

export default function ProviderMediaPage() {
  const t = useTranslations('provider');
  const search = useSearchParams();
  const workspace = useProviderAuthorization();
  const canRead = workspace.hasProviderPermission('property:read');
  const canUpload = workspace.hasProviderPermission('property:update');
  const properties = useProviderProperties(canRead);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const estateId = selected ?? search.get('estateId') ?? '';
  const estate = properties.data?.find((property) => property.id === estateId);
  return (
    <>
      <PageHeader
        title={t('media.title')}
        description={t('media.description')}
        actions={
          <Link
            className="app-button app-button-secondary"
            href="/provider/properties"
          >
            {t('nav.properties')}
          </Link>
        }
      />
      {workspace.state === 'LOADING' || (canRead && properties.isLoading) ? (
        <p role="status">{t('loading')}</p>
      ) : !canRead ? (
        <p role="alert">{t('permissionDenied')}</p>
      ) : properties.isError ? (
        <div className="app-panel space-y-3 p-6">
          <p role="alert">{t('properties.loadFailed')}</p>
          <Button variant="outline" onClick={() => void properties.refetch()}>
            {t('controls.refresh')}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="app-panel p-5 sm:p-6">
            <label htmlFor="media-estate" className="app-label">
              {t('media.property')}
            </label>
            <select
              id="media-estate"
              className="app-control px-3"
              value={estate?.id ?? ''}
              disabled={busy}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">{t('media.selectProperty')}</option>
              {(properties.data ?? [])
                .filter((property) => property.status !== 'ARCHIVED')
                .map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
            </select>
            {properties.data?.length === 0 && (
              <p className="app-help">
                {t('media.noProperties')}{' '}
                <Link
                  className="text-[var(--primary)] underline"
                  href="/provider/properties/new"
                >
                  {t('properties.new')}
                </Link>
              </p>
            )}
          </div>
          {!canUpload && <p role="alert">{t('media.permissionDenied')}</p>}
          {estate && estate.status !== 'ARCHIVED' && (
            <EstateMediaUpload
              key={estate.id}
              estateId={estate.id}
              disabled={!canUpload}
              onBusyChange={setBusy}
            />
          )}
        </div>
      )}
    </>
  );
}
