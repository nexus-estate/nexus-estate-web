'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api/core/error';
import { MAX_IMAGE_BYTES, mediaApi } from '@/lib/api/media/media.api';

type ImageItem = {
  id: string;
  file: File;
  preview: string;
  status: 'ready' | 'uploading' | 'uploaded' | 'failed';
};

export function EstateMediaUpload({
  estateId,
  disabled = false,
  onBusyChange,
}: {
  estateId: string;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const t = useTranslations('provider.media');
  const [items, setItems] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const previews = useRef(new Set<string>());
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (files: File[]) => {
    if (disabled || busyRef.current) return;
    setError(null);
    if (
      files.some(
        (file) =>
          !['image/jpeg', 'image/png'].includes(file.type) ||
          file.size > MAX_IMAGE_BYTES,
      )
    ) {
      setError(t('invalidFile'));
      return;
    }
    setItems((current) => [
      ...current,
      ...files.map((file): ImageItem => {
        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        return { id: crypto.randomUUID(), file, preview, status: 'ready' };
      }),
    ]);
  };
  const upload = async () => {
    if (disabled || busyRef.current || !estateId) return;
    busyRef.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      for (const item of items.filter(
        (image) => image.status === 'ready' || image.status === 'failed',
      )) {
        setItems((current) =>
          current.map((image) =>
            image.id === item.id ? { ...image, status: 'uploading' } : image,
          ),
        );
        try {
          await mediaApi.upload(estateId, item.file);
          setItems((current) =>
            current.map((image) =>
              image.id === item.id ? { ...image, status: 'uploaded' } : image,
            ),
          );
        } catch (cause) {
          setItems((current) =>
            current.map((image) =>
              image.id === item.id ? { ...image, status: 'failed' } : image,
            ),
          );
          setError(
            cause instanceof ApiError && cause.status === 403
              ? t('permissionDenied')
              : t('uploadFailed'),
          );
          break;
        }
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };
  const pending = items.filter(
    (item) => item.status === 'ready' || item.status === 'failed',
  ).length;
  return (
    <section className="app-panel space-y-5 p-5 sm:p-6" aria-label={t('title')}>
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('help')}</p>
      </div>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-interactive)] bg-[var(--surface-subtle)] p-6 text-center hover:border-[var(--primary)] disabled:opacity-50"
      >
        <span aria-hidden="true" className="text-3xl text-[var(--primary)]">
          ↑
        </span>
        <span className="font-semibold">{t('choose')}</span>
        <span className="text-xs text-[var(--text-muted)]">{t('formats')}</span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        disabled={disabled || busy}
        className="sr-only"
        aria-label={t('choose')}
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      {error && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]"
            >
              <Image
                src={item.preview}
                alt={item.file.name}
                width={320}
                height={200}
                unoptimized
                className="aspect-[8/5] w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p
                  role="status"
                  className={`text-xs ${item.status === 'failed' ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}
                >
                  {t(`status.${item.status}`)}
                </p>
                {item.status !== 'uploaded' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      URL.revokeObjectURL(item.preview);
                      previews.current.delete(item.preview);
                      setItems((current) =>
                        current.filter((image) => image.id !== item.id),
                      );
                    }}
                  >
                    {t('remove')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={disabled || pending === 0}
          loading={busy}
          onClick={() => void upload()}
        >
          {busy ? t('uploading') : t('upload', { count: pending })}
        </Button>
        <p className="text-xs text-[var(--text-muted)]">{t('sessionNote')}</p>
      </div>
    </section>
  );
}
