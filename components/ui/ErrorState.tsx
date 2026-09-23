'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

const errorIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <path
      d="M12 8v5m0 3h.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Full-page error surface used by route `error.tsx` boundaries: centred,
 * optionally filling the viewport.
 */
export function ErrorState({
  onRetry,
  homeHref,
  homeLabelKey,
  fullHeight = false,
}: {
  onRetry: () => void;
  homeHref: string;
  homeLabelKey: 'home' | 'adminHome';
  fullHeight?: boolean;
}) {
  const t = useTranslations('common.errorPage');

  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${
        fullHeight ? 'min-h-screen' : 'min-h-[50vh]'
      }`}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-full border border-[var(--danger)]/25 bg-[var(--danger-soft)] text-[var(--danger-strong)]"
        aria-hidden="true"
      >
        {errorIcon}
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text)]">
        {t('title')}
      </h1>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        {t('description')}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRetry}>{t('retry')}</Button>
        <Link href={homeHref} className="btn btn-secondary">
          {t(homeLabelKey)}
        </Link>
      </div>
    </div>
  );
}

/**
 * Inline alert for data-loading failures inside a portal page. Replaces the
 * ad-hoc `<p role="alert">` bands pages used to hand-roll, so every failure
 * carries the same icon, tone and optional retry affordance.
 */
export function ErrorAlert({
  onRetry,
  message,
  className,
}: {
  onRetry?: () => void;
  message: string;
  className?: string;
}) {
  const t = useTranslations('common.errorPage');

  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3',
        className,
      )}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--danger-strong)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path
            d="M12 8v5m0 3h.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium text-[var(--danger-strong)]">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary btn-sm shrink-0"
        >
          {t('retry')}
        </button>
      )}
    </div>
  );
}
