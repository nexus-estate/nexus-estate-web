'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { EstatePurpose } from '@/lib/api/estate/estate.types';
import { leadApi } from '@/lib/api/lead/lead.api';

export function PropertyContactCard({
  price,
  purpose,
  listingId,
}: {
  price: string;
  purpose: EstatePurpose;
  listingId?: string;
}) {
  const t = useTranslations('customer.propertyDetail');
  const [expanded, setExpanded] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState(false);
  const handleLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listingId) return;
    setLeadLoading(true);
    setLeadError(false);
    try {
      await leadApi.create(listingId, leadForm);
      setLeadSent(true);
    } catch {
      setLeadError(true);
    } finally {
      setLeadLoading(false);
    }
  };
  return (
    <aside
      aria-label={t('contactNow')}
      className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2"
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] sm:p-6 lg:sticky lg:top-[88px]">
        <p className="text-xs font-medium text-[var(--text-muted)]">
          {t('priceLabel')}
        </p>
        <p className="mt-2 break-words text-[30px] font-semibold leading-tight tracking-[-.035em] text-[var(--brand-strong)]">
          {price}
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]"
          />
          {purpose === 'SALE'
            ? t('forSale')
            : purpose === 'RENT'
              ? t('forRent')
              : t('forSaleOrRent')}
        </p>
        {listingId ? (
          <div className="mt-6">
            {leadSent ? (
              <div
                role="status"
                className="border-t border-[var(--border)] pt-5"
              >
                <p className="text-sm font-semibold text-[var(--success-strong)]">
                  {t('sent')}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {t('sentDescription')}
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="property-enquiry"
                  onClick={() => setExpanded((value) => !value)}
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                >
                  {t('contactPoster')} <span aria-hidden="true">↗</span>
                </button>
                <p className="mt-3 text-center text-xs leading-5 text-[var(--text-muted)]">
                  {t('enquiryHelp')}
                </p>
                <form
                  id="property-enquiry"
                  hidden={!expanded}
                  onSubmit={handleLeadSubmit}
                  className="mt-5 space-y-4 border-t border-[var(--border)] pt-5"
                >
                  <label className="block text-xs font-medium text-[var(--text)]">
                    {t('name')}
                    <input
                      required
                      type="text"
                      autoComplete="name"
                      value={leadForm.name}
                      onChange={(e) =>
                        setLeadForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="app-control mt-2 min-h-11 px-3 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-medium text-[var(--text)]">
                    {t('phone')}
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={leadForm.phone}
                      onChange={(e) =>
                        setLeadForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="app-control mt-2 min-h-11 px-3 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-medium text-[var(--text)]">
                    {t('message')}
                    <textarea
                      rows={3}
                      value={leadForm.message}
                      onChange={(e) =>
                        setLeadForm((f) => ({ ...f, message: e.target.value }))
                      }
                      className="app-control mt-2 resize-y p-3 text-sm font-normal"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="min-h-12 w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {leadLoading ? t('sending') : t('send')}
                  </button>
                  {leadError && (
                    <p role="alert" className="text-sm text-[var(--danger)]">
                      {t('sendFailed')}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h2 className="text-sm font-semibold text-[var(--brand-strong)]">
              {t('contactPendingTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {t('contactPendingDescription')}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
