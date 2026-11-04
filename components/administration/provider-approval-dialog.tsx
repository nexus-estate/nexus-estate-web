'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function ProviderApprovalDialog({
  open,
  providerName,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  providerName: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const t = useTranslations('administration.providerReview');

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="admin-approval-dialog"
      aria-labelledby="provider-approval-title"
      aria-describedby="provider-approval-description"
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onClose}
    >
      <div className="border-b border-[var(--border)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {t('decision')}
        </p>
        <h2
          id="provider-approval-title"
          className="mt-2 text-lg font-semibold tracking-tight"
        >
          {t('approveDialogTitle', { name: providerName })}
        </h2>
        <p
          id="provider-approval-description"
          className="mt-2 text-sm leading-6 text-[var(--text-muted)]"
        >
          {t('confirm')}
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-2 bg-[var(--surface-subtle)] px-6 py-4">
        <button
          type="button"
          className="admin-button-secondary"
          disabled={busy}
          onClick={onClose}
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          className="admin-button-primary"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? t('approving') : t('approve')}
        </button>
      </div>
    </dialog>
  );
}
