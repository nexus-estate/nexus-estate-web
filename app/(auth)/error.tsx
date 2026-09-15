'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const t = useTranslations('common.errorPage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-[var(--danger-soft)] p-6 text-[var(--danger)]">
        <span aria-hidden="true" className="text-3xl">
          !
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[var(--text)]">
        {t('title')}
      </h1>
      <p className="mt-2 text-[var(--text-muted)]">{t('description')}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {t('retry')}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
