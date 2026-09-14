import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcon = (
  <svg
    className="h-10 w-10 text-[var(--text-subtle)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border-muted)] bg-[var(--surface)] p-3 shadow-[var(--shadow-xs)]">
        {icon || defaultIcon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-[var(--text)]">{title}</h3>
      {description && (
        <p className="mb-5 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex min-h-10 items-center rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--primary-hover)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
