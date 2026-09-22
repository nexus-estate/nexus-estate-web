import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function MainNotFound() {
  const t = await getTranslations('common.notFoundPage');

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[var(--content-max)] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <span
        className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-subtle)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m16 16 4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        {t('description')}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link href="/properties" className="btn btn-primary">
          {t('search')}
        </Link>
        <Link href="/" className="btn btn-secondary">
          ←
        </Link>
      </div>
    </div>
  );
}
