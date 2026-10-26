'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import type { EstateMedia } from '@/lib/api/media/media.api';
import { PropertyGalleryImage } from './estate-gallery-image';

export function PropertyGalleryModal({
  images,
  title,
  initialIndex,
  onClose,
}: {
  images: EstateMedia[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const t = useTranslations('customer.gallery');
  const [index, setIndex] = useState(initialIndex);
  const dialog = useRef<HTMLDialogElement>(null);
  const move = (step: number) =>
    setIndex((current) => (current + step + images.length) % images.length);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      aria-label={t('title', { title })}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
      className="fixed inset-0 m-auto h-[100dvh] max-h-none w-screen max-w-none border-0 bg-[var(--surface)] p-0 text-[var(--text)] shadow-[var(--shadow-lg)] backdrop:bg-black/80 sm:h-[92dvh] sm:w-[94vw] sm:rounded-[var(--radius-xl)]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-3">
          <p className="truncate text-sm font-semibold">{title}</p>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label={t('close')}
            className="app-button h-11 w-11 shrink-0 text-2xl"
          >
            ×
          </button>
        </header>
        <div className="relative min-h-0 flex-1 bg-[var(--surface-subtle)]">
          <PropertyGalleryImage
            key={images[index].id}
            image={images[index]}
            title={t('image', { title, number: index + 1 })}
            contain
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={t('previous')}
                className="app-button absolute left-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-[var(--surface)] text-2xl shadow-[var(--shadow-md)]"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label={t('next')}
                className="app-button absolute right-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-[var(--surface)] text-2xl shadow-[var(--shadow-md)]"
              >
                →
              </button>
            </>
          )}
        </div>
        <p
          aria-live="polite"
          aria-atomic="true"
          className="border-t border-[var(--border)] py-4 text-center text-sm tabular-nums"
        >
          {index + 1} / {images.length}
        </p>
      </div>
    </dialog>,
    document.body,
  );
}
