import { useMemo, useState } from 'react';
import clsx from 'clsx';

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
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
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
}: TableProps<T>) {
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

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
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
      <div className="rounded-lg border border-gray-200 bg-white">
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="mb-3 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-sm font-medium">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
                    col.sortable &&
                      'cursor-pointer select-none hover:bg-gray-100',
                    col.headerClassName,
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-gray-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={columns.length} />
                ))
              : paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={clsx(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          'whitespace-nowrap px-4 py-3 text-sm text-gray-700',
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
        <div className="flex items-center justify-between border-t px-4 py-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
