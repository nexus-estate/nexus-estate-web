'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { leadApi } from '@/lib/api/lead/lead.api';
import { FEEDBACK, notify } from '@/lib/notify';

/** Lead capture for a single listing. Extracted so the detail page can stay a Server Component. */
export function PropertyLeadForm({ listingId }: { listingId: string }) {
  const t = useTranslations('customer.propertyDetail');
  const commonT = useTranslations('common');
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await leadApi.create(listingId, {
        name: form.name,
        phone: form.phone,
        message: form.message,
      });
      setSent(true);
      notify.success(commonT(FEEDBACK.sent));
    } catch (cause) {
      setError(true);
      notify.apiError(cause, commonT, 'propertyDetail.sendFailed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="mt-4 rounded-[var(--radius-md)] border border-[var(--success)]/25 bg-[var(--success-soft)] px-4 py-3"
        role="status"
      >
        <p className="text-sm font-semibold text-[var(--success-strong)]">
          {t('sent')}
        </p>
        <p className="mt-0.5 text-xs text-[var(--success-strong)]">
          {t('sentDescription')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="field-label" htmlFor="lead-name">
          {t('name')}
        </label>
        <input
          id="lead-name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          className="field"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="lead-phone">
          {t('phone')}
        </label>
        <input
          id="lead-phone"
          type="tel"
          required
          autoComplete="tel"
          value={form.phone}
          onChange={(event) =>
            setForm((current) => ({ ...current, phone: event.target.value }))
          }
          className="field"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="lead-message">
          {t('message')}
        </label>
        <textarea
          id="lead-message"
          rows={3}
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          className="field"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg w-full"
      >
        {loading ? t('sending') : t('send')}
      </button>
      {error && (
        <p role="alert" className="field-error">
          {t('sendFailed')}
        </p>
      )}
    </form>
  );
}
