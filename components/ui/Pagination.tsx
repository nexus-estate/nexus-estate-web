import Link from 'next/link';
import clsx from 'clsx';

function pageWindow(current: number, total: number, span = 1): number[] {
  const pages = new Set<number>([1, total]);
  for (let page = current - span; page <= current + span; page += 1) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  return [...pages].sort((left, right) => left - right);
}

/**
 * Link-based pagination so every page has a crawlable URL. Client-side state
 * would hide results from search engines and break the back button.
 */
export function Pagination({
  page,
  totalPages,
  hrefForPage,
  labels,
  className,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  labels: { previous: string; next: string; pageOf: string };
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);
  const linkClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]';
  const disabledClass =
    'pointer-events-none inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-muted)] bg-[var(--surface-subtle)] px-2.5 text-sm font-medium text-[var(--text-disabled)]';

  return (
    <nav
      className={clsx(
        'mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-muted)] pt-4',
        className,
      )}
      aria-label={labels.pageOf}
    >
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={hrefForPage(page - 1)} className={linkClass} rel="prev">
            ← {labels.previous}
          </Link>
        ) : (
          <span className={disabledClass}>← {labels.previous}</span>
        )}
      </div>

      <ol className="flex items-center gap-1">
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          const gap = previous !== undefined && item - previous > 1;
          return (
            <li key={item} className="flex items-center gap-1">
              {gap && (
                <span
                  aria-hidden="true"
                  className="px-1 text-sm text-[var(--text-subtle)]"
                >
                  …
                </span>
              )}
              {item === page ? (
                <span
                  aria-current="page"
                  className="inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--primary)] bg-[var(--primary)] px-2 text-sm font-semibold text-[var(--text-on-accent)]"
                >
                  {item}
                </span>
              ) : (
                <Link href={hrefForPage(item)} className={linkClass}>
                  {item}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-1.5">
        {page < totalPages ? (
          <Link href={hrefForPage(page + 1)} className={linkClass} rel="next">
            {labels.next} →
          </Link>
        ) : (
          <span className={disabledClass}>{labels.next} →</span>
        )}
      </div>
    </nav>
  );
}
