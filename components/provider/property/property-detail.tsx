'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { EstateMediaUpload } from '@/components/media/estate-media-upload';
import { EstateGallery } from '@/components/shared/estate-gallery';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProviderAuthorization } from '@/features/provider/context/provider-context.hooks';
import { useProviderContext } from '@/features/provider/context/provider-context.provider';
import {
  estateListings,
  publicListings,
} from '@/features/provider/supply/property-visibility';
import {
  useProviderProperty,
  useProviderListings,
  useProviderEstateMedia,
  useCreateProviderListing,
  usePublishProviderListing,
  useArchiveProviderListing,
  useActivateProviderProperty,
  useRestoreProviderProperty,
} from '@/features/provider/supply/provider-supply.queries';
import { ApiError } from '@/lib/api/core/error';
import { getMarketplaceUrl } from '@/lib/platform/urls';
import '@/app/provider/properties/properties.css';

export function PropertyDetail({
  id,
  listingId,
}: {
  id: string;
  listingId?: string;
}) {
  const { providerId } = useProviderContext();
  return <Detail key={`${providerId}:${id}`} id={id} listingId={listingId} />;
}

function Detail({ id, listingId }: { id: string; listingId?: string }) {
  const t = useTranslations('provider');
  const locale = useLocale();
  const search = useSearchParams();
  const workspace = useProviderAuthorization();
  const canRead = workspace.can('property:read');
  const canReadListings = workspace.can('listing:read');
  const property = useProviderProperty(id, canRead);
  const listings = useProviderListings(canReadListings);
  const estate = property.data;
  const media = useProviderEstateMedia(
    id,
    canRead && estate?.status === 'ACTIVE',
  );
  const create = useCreateProviderListing();
  const publish = usePublishProviderListing();
  const archive = useArchiveProviderListing();
  const activate = useActivateProviderProperty();
  const restore = useRestoreProviderProperty();
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const owned = estate ? estateListings(estate, listings.data ?? []) : [];
  const selected =
    owned.find((item) => item.id === (search.get('listing') ?? listingId)) ??
    owned.find((item) => item.status === 'PUBLISHED') ??
    owned.find((item) => item.status === 'DRAFT') ??
    owned[0];
  const known = canReadListings && listings.isSuccess && !listings.isError;
  const visible = !!estate && known && publicListings(estate, owned).length > 0;
  const selectedVisible =
    !!estate && !!selected && publicListings(estate, [selected]).length > 0;
  const status = known ? (visible ? 'public' : 'private') : 'unknown';
  const editHref = `/provider/properties/${encodeURIComponent(id)}/edit`;
  let publicUrl: string | null = null;
  if (selectedVisible) {
    try {
      publicUrl = getMarketplaceUrl(
        `/properties/${encodeURIComponent(selected.id)}`,
      );
    } catch {
      /* Deployment has no marketplace URL configured. */
    }
  }
  const run = async (
    action: 'publish' | 'archive' | 'activate' | 'restore',
  ) => {
    if (lock.current || !estate) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (action === 'activate') await activate.mutateAsync(id);
      else if (action === 'restore') await restore.mutateAsync(id);
      else if (action === 'archive' && selected)
        await archive.mutateAsync(selected.id);
      else if (action === 'publish' && known) {
        // Reuse the selected draft. Never recreate an archived or existing listing.
        const target = selected ?? (await create.mutateAsync({ estateId: id }));
        if (!mounted.current) return;
        await publish.mutateAsync(target.id);
      }
      if (!mounted.current) return;
      await Promise.all([
        property.refetch(),
        canReadListings ? listings.refetch() : Promise.resolve(),
      ]);
      setConfirm(false);
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 403
          ? t('permissionDenied')
          : cause instanceof ApiError &&
              cause.code === 'PROPERTY_ACTIVATION_INCOMPLETE'
            ? t('properties.activationIncomplete')
            : cause instanceof ApiError &&
                cause.code === 'LISTING_PROPERTY_NOT_ACTIVE'
              ? t('listings.propertyNotActive')
              : cause instanceof ApiError
                ? cause.message
                : t('listings.actionFailed'),
      );
      // Creation may have succeeded even if publishing failed: reuse that draft on retry.
      if (mounted.current && canReadListings) await listings.refetch();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  if (workspace.state === 'LOADING' || (canRead && property.isLoading))
    return <p role="status">{t('loading')}</p>;
  if (workspace.state !== 'ACTIVE_VERIFIED')
    return (
      <div role="alert">
        <p>{t(`lifecycle.${workspace.state.toLowerCase()}`)}</p>
        <Link href="/provider/account">{t('nav.account')}</Link>
      </div>
    );
  if (!canRead) return <p role="alert">{t('permissionDenied')}</p>;
  if (property.isError || !estate)
    return (
      <div role="alert">
        <p>{t('properties.loadFailed')}</p>
        <Button onClick={() => void property.refetch()}>
          {t('controls.refresh')}
        </Button>
      </div>
    );
  return (
    <div className="property-detail">
      <header className="property-detail-heading">
        <div>
          <Link href="/provider/properties">{t('nav.properties')} /</Link>
          <h1>{estate.title}</h1>
          <p>
            {[estate.addressLine, estate.ward?.name, estate.province?.name]
              .filter(Boolean)
              .join(', ')}
          </p>
          <span className={`property-visibility property-visibility-${status}`}>
            {t(`unified.${status}`)}
          </span>
        </div>
        {workspace.can('property:update') && (
          <Link
            className="provider-button provider-button-secondary"
            href={editHref}
          >
            {t('unified.editProfile')}
          </Link>
        )}
      </header>
      <div className="property-detail-grid">
        <main className="space-y-5 min-w-0">
          <section className="property-detail-panel property-gallery">
            {estate.status === 'ACTIVE' ? (
              <EstateGallery
                estateId={id}
                title={estate.title}
                media={media.data}
                loading={media.isLoading}
                error={media.isError}
                onRetry={() => void media.refetch()}
                provider
              />
            ) : (
              <div className="inventory-placeholder min-h-64">
                {t('listingDetail.privateMediaUnavailable')}
              </div>
            )}
            {workspace.can('property:update') &&
              estate.status !== 'ARCHIVED' && (
                <Button variant="outline" onClick={() => setImagesOpen(true)}>
                  {t('properties.inventory.manageImages')}
                </Button>
              )}
          </section>
          <section className="property-detail-panel">
            <h2>{t('unified.information')}</h2>
            <p className="property-price">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(estate.price)}
            </p>
            <div className="property-facts">
              {estate.area != null && <span>{estate.area} m²</span>}
              {estate.bedrooms != null && (
                <span>
                  {t('properties.inventory.bedrooms', {
                    count: estate.bedrooms,
                  })}
                </span>
              )}
              {estate.bathrooms != null && (
                <span>
                  {t('properties.inventory.bathrooms', {
                    count: estate.bathrooms,
                  })}
                </span>
              )}
              <span>{t(`properties.types.${estate.type}`)}</span>
              <span>{t(`properties.purposes.${estate.purpose}`)}</span>
            </div>
          </section>
          <section className="property-detail-panel">
            <div className="flex justify-between gap-4 flex-wrap">
              <h2>{t('unified.content')}</h2>
              {workspace.can('property:update') && (
                <Link href={`${editHref}#estate-description`}>
                  {t('unified.editContent')}
                </Link>
              )}
            </div>
            <h3>{estate.title}</h3>
            <p className="whitespace-pre-line">
              {estate.description || t('listingDetail.noDescription')}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {t('unified.sharedContent')}
            </p>
          </section>
        </main>
        <aside className="space-y-5 min-w-0">
          <section className="property-detail-panel space-y-4">
            <h2>{t('unified.marketplace')}</h2>
            {!canReadListings ? (
              <p>{t('permissionDenied')}</p>
            ) : listings.isError ? (
              <div role="alert">
                <p>{t('unified.visibilityError')}</p>
                <Button onClick={() => void listings.refetch()}>
                  {t('controls.refresh')}
                </Button>
              </div>
            ) : !known ? (
              <p role="status">{t('loading')}</p>
            ) : (
              <>
                {owned.length > 1 && (
                  <label className="block">
                    {t('unified.selectListing')}
                    <select
                      className="app-control w-full"
                      disabled={busy}
                      value={selected?.id ?? ''}
                      onChange={(event) => {
                        const params = new URLSearchParams(search.toString());
                        params.set('listing', event.target.value);
                        window.history.replaceState(null, '', `?${params}`);
                      }}
                    >
                      {owned.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} · {t(`listings.status.${item.status}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <span
                  className={`property-visibility property-visibility-${selectedVisible ? 'public' : 'private'}`}
                >
                  {t(`unified.${selectedVisible ? 'public' : 'private'}`)}
                </span>
                <p>
                  {t(
                    selectedVisible
                      ? 'unified.publicHelp'
                      : 'unified.privateHelp',
                  )}
                </p>
                {publicUrl && (
                  <a
                    className="provider-button provider-button-primary w-full"
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('listingDetail.viewMarketplace')} ↗
                  </a>
                )}
                {selected?.status === 'PUBLISHED' &&
                  workspace.can('listing:archive') && (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setConfirm(true)}
                    >
                      {t('unified.unpublish')}
                    </Button>
                  )}
                {selected?.status === 'ARCHIVED' ? (
                  <p>{t('unified.archived')}</p>
                ) : estate.status !== 'ACTIVE' ? (
                  <div className="space-y-3">
                    <p>{t('unified.activateHelp')}</p>
                    {workspace.can('property:update') && (
                      <>
                        <Link href={editHref}>{t('unified.editProfile')}</Link>
                        <Button
                          disabled={busy}
                          onClick={() =>
                            void run(
                              estate.status === 'ARCHIVED'
                                ? 'restore'
                                : 'activate',
                            )
                          }
                        >
                          {t(
                            estate.status === 'ARCHIVED'
                              ? 'properties.restore'
                              : 'properties.activate',
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  (!selected || selected.status === 'DRAFT') &&
                  (workspace.can('listing:publish') &&
                  (selected || workspace.can('listing:create')) ? (
                    <Button
                      className="w-full"
                      disabled={busy}
                      onClick={() => void run('publish')}
                    >
                      {t(busy ? 'listings.publishing' : 'unified.publish')}
                    </Button>
                  ) : (
                    <p>{t('permissionDenied')}</p>
                  ))
                )}
              </>
            )}
            {error && (
              <p role="alert" className="text-[var(--danger)]">
                {error}
              </p>
            )}
          </section>
          <section className="property-detail-panel property-promotion">
            <h2>{t('unified.promotion')}</h2>
            <p>{t('unified.promotionUnavailable')}</p>
          </section>
        </aside>
      </div>
      <Modal
        isOpen={imagesOpen}
        onClose={() => {
          if (!uploading) {
            setImagesOpen(false);
            void media.refetch();
          }
        }}
        title={t('properties.inventory.manageImages')}
      >
        <EstateMediaUpload
          estateId={id}
          onBusyChange={(value) => {
            setUploading(value);
            if (!value && estate.status === 'ACTIVE') void media.refetch();
          }}
        />
      </Modal>
      <Modal
        isOpen={confirm}
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
        title={t('unified.unpublish')}
        footer={
          <Button disabled={busy} onClick={() => void run('archive')}>
            {t('unified.unpublish')}
          </Button>
        }
      >
        <p>{t('unified.archiveWarning')}</p>
        {error && <p role="alert">{error}</p>}
      </Modal>
    </div>
  );
}
