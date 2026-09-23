'use client';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  pageSize?: number;
  /** Accessible name for the table; every table needs one. */
  caption?: string;
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  onRowClick,
  emptyState,
  pageSize = 10,
  caption,
}: TableProps<T>) {
  const t = useTranslations('common');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(Math.ceil(sortedData.length / pageSize), 1);
  // Clamp instead of trusting state: shrinking `data` (a new filter, a refetch)
  // used to leave the table on an out-of-range page, rendering an empty body
  // with no way back to the visible rows.
  const activePage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  if (!isLoading && data.length === 0) {
    return (
      <div className="panel">
        {emptyState || (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <svg
              className="mb-3 h-6 w-6 text-[var(--text-subtle)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {t('status.empty')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-muted)]">
          <caption className="sr-only">{caption ?? t('table.label')}</caption>
          <thead className="bg-[var(--surface-subtle)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={clsx(
                    'px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-muted)]',
                    col.sortable &&
                      'cursor-pointer select-none transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
                    col.headerClassName,
                  )}
                  aria-sort={
                    col.sortable && sortKey === col.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : col.sortable
                        ? 'none'
                        : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-left font-semibold"
                      onClick={() => handleSort(col.key)}
                    >
                      <span>{col.header}</span>
                      <span
                        aria-hidden="true"
                        className="text-[var(--text-subtle)]"
                      >
                        {sortKey === col.key
                          ? sortDirection === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-muted)] bg-[var(--surface)]">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={columns.length} />
                ))
              : paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    // Clickable rows must be reachable and operable by keyboard.
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick(item);
                            }
                          }
                        : undefined
                    }
                    className={clsx(
                      'transition-colors',
                      onRowClick &&
                        'cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)]',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          'whitespace-nowrap px-4 py-3 text-sm text-[var(--text)]',
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(item)
                          : String(
                              (item as Record<string, unknown>)[col.key] ?? '',
                            )}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-muted)] bg-[var(--surface-subtle)] px-4 py-2.5">
          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1))
            }
            disabled={activePage === 1}
            className="btn btn-secondary btn-sm"
          >
            {t('pagination.previous')}
          </button>
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {t('pagination.pageOf', {
              current: activePage,
              total: totalPages,
            })}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, Math.min(p, totalPages) + 1),
              )
            }
            disabled={activePage === totalPages}
            className="btn btn-secondary btn-sm"
          >
            {t('pagination.next')}
          </button>
        </div>
      )}
    </div>
  );
}
