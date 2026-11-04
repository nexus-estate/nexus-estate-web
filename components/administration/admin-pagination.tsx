'use client';

import { useTranslations } from 'next-intl';
import type { PaginationMeta } from '@/lib/api/administration/types';

export function AdminPagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations('administration.authorization');
  const totalPages = Math.max(meta.totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-muted)] px-5 py-3.5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>
        {t('pageSummary', {
          page: meta.page,
          totalPages,
          total: meta.total,
        })}
      </p>
      <nav aria-label={t('pagination')} className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          {t('previous')}
        </button>
        <span className="min-w-16 text-center font-medium text-[var(--text)]">
          {meta.page} / {totalPages}
        </span>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          {t('next')}
        </button>
      </nav>
    </div>
  );
}
