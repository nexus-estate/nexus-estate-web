import clsx from 'clsx';

export function LoadingState({
  label,
  className,
  compact = false,
}: {
  label: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 text-sm text-[var(--text-muted)]',
        compact ? 'py-3' : 'justify-center py-12',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--primary)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
